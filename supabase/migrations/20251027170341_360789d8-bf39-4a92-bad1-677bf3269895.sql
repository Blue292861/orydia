-- Add opf_url column to book_chapter_epubs table
ALTER TABLE book_chapter_epubs 
ADD COLUMN IF NOT EXISTS opf_url text;

COMMENT ON COLUMN book_chapter_epubs.opf_url IS 'URL of custom OPF file to override EPUB default structure';