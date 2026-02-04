-- Step 1: Clear existing string user_ids (required before column type change)
UPDATE activity_logs SET user_id = NULL;

-- Step 2: Change column type to INT
ALTER TABLE activity_logs MODIFY COLUMN user_id INT UNSIGNED NULL;
