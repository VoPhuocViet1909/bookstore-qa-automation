-- Migration script to fix created_at column issue
-- Run this script manually in MySQL if needed

-- Step 1: Add created_at column with DEFAULT value (if not exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6);

-- Step 2: Update existing NULL values with current timestamp
UPDATE users
SET created_at = CURRENT_TIMESTAMP(6)
WHERE created_at IS NULL OR created_at = '0000-00-00 00:00:00';

-- Step 3: Make column NOT NULL
ALTER TABLE users
MODIFY COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

-- Step 4: Add updated_at column with DEFAULT and ON UPDATE
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

-- Step 5: Add other new columns for User entity
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login DATETIME(6);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(20) DEFAULT 'BRONZE';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND TABLE_SCHEMA = 'bookstore_db'
ORDER BY ORDINAL_POSITION;

