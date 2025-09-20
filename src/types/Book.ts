
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  content: string;
  summary?: string;
  points: number;
  tags: string[];
  genres: string[];
  isPremium: boolean;
  isMonthSuccess: boolean;
  isPacoFavourite: boolean;
  hasChapters: boolean;
  isInteractive: boolean;
  isAdultContent: boolean;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  isInteractive: boolean;
  createdAt: string;
  updatedAt: string;
  choices?: InteractiveChoice[];
}

export interface InteractiveChoice {
  id: string;
  chapterId: string;
  choiceText: string;
  consequenceText?: string;
  nextChapterId?: string;
  pointsModifier: number;
  createdAt: string;
}

export interface UserChapterProgress {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface UserStoryChoice {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  choiceId: string;
  chosenAt: string;
}
