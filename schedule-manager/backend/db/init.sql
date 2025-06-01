-- db/init.sql

DROP TABLE IF EXISTS schedule;

CREATE TABLE schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL, -- endはpythonでSQL側に送信
    memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
);

CREATE TABLE article_tags (
    schedule_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY(schedule_id, tag_id)
    FOREIGN KEY(schedule_id) REFERENCES schedule(id)
    FOREIGN KEY(tag_id) REFERENCES tags(id)
);