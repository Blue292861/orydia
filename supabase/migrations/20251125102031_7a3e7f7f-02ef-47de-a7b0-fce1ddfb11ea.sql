-- Add merged_epub_url column to store pre-merged EPUBs
ALTER TABLE book_chapter_epubs 
ADD COLUMN merged_epub_url TEXT;