-- Corriger les positions des chapitres existants pour qu'elles correspondent aux chapter_number
UPDATE book_chapter_epubs
SET position = chapter_number
WHERE book_id = '474f633e-cc4e-422f-8e1a-91ccc3721d69';