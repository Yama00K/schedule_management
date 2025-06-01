import re

def db_manager(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_text = f.read()

    queries = {}

    pattern = re.compile(r"-- name: (\w+)\n(.*?)(?=\n-- name:|\Z)", re.DOTALL)

    for match in pattern.finditer(sql_text):
        name = match.group(1)
        sql = match.group(2)
        queries[name] = sql

    return queries