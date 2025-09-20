// src/pages/WorkPage.tsx
// ...
import { EpubReaderWithBlob } from '@/components/EpubReaderWithBlob';
// ...
// ...
const isEpub = workType === 'book' && (foundWork as Book).content && isUrl((foundWork as Book).content) && (foundWork as Book).content.endsWith('.epub');

return (
  // ...
  <div className="mt-6">
    {isEpub ? (
      <EpubReaderWithBlob url={(foundWork as Book).content} />
    ) : (
      <TextReader content={foundWork.content as string} />
    )}
  </div>
  // ...
);
