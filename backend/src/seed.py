import sys
from datetime import datetime

# `src`ディレクトリにパスを通す
sys.path.append('./src')

from database import SessionLocal
from models import Schedule, Tag # Tagモデルもインポート

# データベースセッションを取得
db = SessionLocal()

# --- データベースのクリーンアップ（任意） ---
# 実行順序に注意: ScheduleはTagに依存しているので、先にScheduleを削除
db.query(Schedule).delete()
db.query(Tag).delete()
db.commit()
print("既存のスケジュールとタグを削除しました。")

# --- 1. 先にTagデータを投入 ---
try:
    print("タグデータを投入します...")
    seed_tags = [
        Tag(name="仕事"),   # id=1 になる想定
        Tag(name="プライベート"), # id=2 になる想定
        Tag(name="学習"),   # id=3 になる想定
    ]
    db.add_all(seed_tags)
    db.commit()
    print("タグデータの投入が完了しました。")

    # --- 2. 投入したTagのIDを取得 ---
    # データベースから今投入したタグを名前で検索して取得
    work_tag = db.query(Tag).filter_by(name="仕事").first()
    private_tag = db.query(Tag).filter_by(name="プライベート").first()
    learning_tag = db.query(Tag).filter_by(name="学習").first()

    # --- 3. TagのIDを使ってScheduleデータを作成・投入 ---
    print("スケジュールデータを投入します...")
    seed_schedules = [
        Schedule(
            title="チーム定例会議",
            description="週次の進捗確認ミーティング",
            start_time=datetime(2025, 9, 15, 10, 0, 0),
            end_time=datetime(2025, 9, 15, 11, 0, 0),
            tag_id=work_tag.id # 取得したIDを指定
        ),
        Schedule(
            title="友人とカラオケ",
            description="駅前のカラオケで遊ぶ",
            start_time=datetime(2025, 9, 15, 12, 30, 0),
            end_time=datetime(2025, 9, 15, 14, 0, 0),
            tag_id=private_tag.id # 取得したIDを指定
        ),
        Schedule(
            title="研究室のゼミ",
            description="研究の進捗を報告",
            start_time=datetime(2025, 9, 16, 19, 0, 0),
            end_time=datetime(2025, 9, 16, 21, 0, 0),
            tag_id=learning_tag.id # 取得したIDを指定
        ),
    ]
    db.add_all(seed_schedules)
    db.commit()
    print("スケジュールデータの投入が完了しました。")

except Exception as e:
    print(f"エラーが発生しました: {e}")
    db.rollback()
finally:
    db.close()
    print("データベースセッションを閉じました。")