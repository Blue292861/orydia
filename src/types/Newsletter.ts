export interface NewsletterAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Newsletter {
  id: string;
  subject: string;
  content: string;
  attachments: NewsletterAttachment[];
  status: 'draft' | 'sending' | 'sent' | 'failed';
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}
