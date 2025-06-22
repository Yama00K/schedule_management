# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from db.db_manager import db_manager
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

working_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(working_dir,'db')
conn = sqlite3.connect(os.path.join(db_path, 'schedule.db'), check_same_thread=False)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
queries = db_manager(os.path.join(db_path, 'queries.sql'))  # 命令の辞書
sql_db_path = os.path.join(db_path, 'init.sql')
with open(sql_db_path, 'r', encoding='utf-8') as f:
    sql_db = f.read()
cursor.executescript(sql_db)

@app.route('/schedules')
def get_monthly_schedules():
    cursor.execute(queries['get_all_schedules'])
    rows = cursor.fetchall()
    schedules = [dict(row) for row in rows]
    month_str = request.args.get('month')
    if not month_str:
        now = datetime.now()
        month_str = now.strftime('%Y-%m')
    try:
        month_start = datetime.strptime(month_str, '%Y-%m')
        month_str = month_start.strftime('%m')
        year_str = month_start.strftime('%Y')
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)
    except ValueError:
        return jsonify({"error": "Invalid month format. Use YYYY-MM"}), 400

    def overlaps(schedule):
        start = datetime.strptime(schedule['start'], '%Y-%m-%dT%H:%M:%S')
        end = datetime.strptime(schedule['end'], '%Y-%m-%dT%H:%M:%S')
        return not (end < month_start or start >= month_end)

    filtered = [s for s in schedules if overlaps(s)]
    return jsonify({
        'year': year_str,   # カレンダー生成用
        'month': month_str, # カレンダー生成用
        'schedules': filtered
    })

@app.route('/schedules/get_byid/<int:id>')
def get_schedule_by_id(id):
    cursor.execute(queries['get_schedule_by_id'], {'id': id})
    row = cursor.fetchone()
    schedules = dict(row[0])
    if not schedules:
        return jsonify({"error": "Schedule not found"}), 404
    return jsonify(schedules)

@app.route('/schedules', methods=['POST'])
def add_schedule():
    data = request.json
    cursor.execute(
        queries['insert_schedule'],
        {
            'title': data['title'],
            'start': data['start'],
            'end': data['end'],
            'tags': data.get('tags'),
            'memo': data.get('memo')
        }
    )
    conn.commit()
    return jsonify({"message":"OK"}),201

@app.route('/schedules/<int:id>', methods=['PUT'])
def update_schedule():
    data = request.json
    dt = datetime.now()
    created_at = dt.strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute(
        queries['update_schedule'],
        {
            'id': id,
            'title': data['title'],
            'start': data['start'],
            'end': data['end'],
            'tags': data.get('tags'),
            'memo': data.get('memo'),
            'created_at': created_at
        }
    )
    conn.commit()

    # 更新されたかチェック
    if cursor.rowcount == 0:
        return jsonify({"error": "Schedule not found"}), 404

    return jsonify({"message": "Schedule updated successfully"}), 200

@app.route('/schedules/<int:id>', methods=['DELETE'])
def delete_schedule():
    data =  request.json
    cursor.execute(queries['delete_schedule'], {'id': data['id']})

# Nginx経由で起動するので不要
# if __name__ == '__main__':
#     app.run(debug=True)
