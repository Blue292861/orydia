import React from 'react';
import { Helmet } from 'react-helmet-async';

interface WorkMetaProps {
  title: string;
  author: string;
  description?: string;
  coverUrl: string;
  workType: 'book' | 'audiobook';
}

export const WorkMeta: React.FC<WorkMetaProps> = ({
  title,
  author,
  description,
  coverUrl,
  workType
}) => {
  const pageTitle = `${title} par ${author} - Orydia`;
  const pageDescription = description || 
    `Découvrez ${workType === 'book' ? 'le livre' : 'le livre audio'} "${title}" par ${author} sur Orydia, votre plateforme de lecture numérique.`;
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="book" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={coverUrl} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content="Orydia" />
      
      {/* Book-specific Open Graph */}
      <meta property="book:author" content={author} />
      <meta property="book:tag" content={workType} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={coverUrl} />
      
      {/* Additional SEO */}
      <meta name="author" content={author} />
      <meta name="keywords" content={`${title}, ${author}, livre, ebook, audiobook, orydia, lecture`} />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};