
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  content: string;
  points: number;
  tags: string[];
  isPremium: boolean;
}
