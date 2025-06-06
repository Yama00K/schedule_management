-- db/queries.sql

-- name: get_all_schedules
SELECT * FROM schedules ORDER BY start;

-- name: get_schedule_by_id
SELECT * FROM schedules WHERE id = :id;

-- name: insert_schedule
INSERT INTO schedules (title, start, end, memo)
VALUES (:title, :start, :end, :memo);

-- name: update_schedule
UPDATE schedules
SET title = :title,
    start = :start,
    end = :end,
    memo = :memo,
    created_at = :created_at
WHERE id = :id;

-- name: delete_schedule
DELETE FROM schedules WHERE id = :id;