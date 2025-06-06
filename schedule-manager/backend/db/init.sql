-- db/init.sql

CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL, -- endはpythonでSQL側に送信
    memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS article_tags (
    schedule_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY(schedule_id, tag_id)
    FOREIGN KEY(schedule_id) REFERENCES schedules(id)
    FOREIGN KEY(tag_id) REFERENCES tags(id)
);

INSERT INTO schedules (title, start, end)
VALUES ('テスト予定', '2025-06-06T09:00:00', '2025-06-06T10:00:00');