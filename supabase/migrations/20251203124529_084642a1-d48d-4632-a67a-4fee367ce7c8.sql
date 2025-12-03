-- Add is_interactive to audiobooks
ALTER TABLE audiobooks ADD COLUMN IF NOT EXISTS is_interactive boolean NOT NULL DEFAULT false;

-- Add is_ending and ending_reward_points to book_chapters
ALTER TABLE book_chapters ADD COLUMN IF NOT EXISTS is_ending boolean NOT NULL DEFAULT false;
ALTER TABLE book_chapters ADD COLUMN IF NOT EXISTS ending_reward_points integer DEFAULT 0;

-- Add is_interactive, is_ending and ending_reward_points to audiobook_chapters
ALTER TABLE audiobook_chapters ADD COLUMN IF NOT EXISTS is_interactive boolean NOT NULL DEFAULT false;
ALTER TABLE audiobook_chapters ADD COLUMN IF NOT EXISTS is_ending boolean NOT NULL DEFAULT false;
ALTER TABLE audiobook_chapters ADD COLUMN IF NOT EXISTS ending_reward_points integer DEFAULT 0;