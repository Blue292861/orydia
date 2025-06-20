
import { ReactNode } from 'react';

export interface TensensPack {
  id: string;
  name: string;
  tensens: number;
  price: number;
  description: string;
  originalPrice?: number;
  popular?: boolean;
  savings?: string;
  bonus?: string;
  icon: ReactNode;
}
