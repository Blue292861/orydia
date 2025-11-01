-- Create view for book translation status monitoring
CREATE OR REPLACE VIEW book_translation_status AS
SELECT 
  b.id,
  b.title,
  b.author,
  COUNT(DISTINCT c.id) as total_chapters,
  COUNT(DISTINCT ct.chapter_id) FILTER (WHERE ct.status = 'completed') as translated_chapter_count,
  CASE 
    WHEN COUNT(DISTINCT c.id) = 0 THEN 'none'
    WHEN COUNT(DISTINCT ct.chapter_id) FILTER (WHERE ct.status = 'completed') >= COUNT(DISTINCT c.id) * 6 THEN 'complete'
    WHEN COUNT(DISTINCT ct.chapter_id) > 0 THEN 'partial'
    ELSE 'none'
  END as translation_status
FROM books b
LEFT JOIN book_chapter_epubs c ON c.book_id = b.id
LEFT JOIN chapter_translations ct ON ct.chapter_id = c.id
GROUP BY b.id, b.title, b.author
ORDER BY b.title;