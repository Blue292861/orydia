export interface OrydorsPack {
  id: string;
  name: string;
  orydors: number;
  price: number; // Prix en centimes
  originalPrice?: number; // Prix original avant réduction
  bonus?: string;
  savings?: string;
  popular?: boolean;
  icon: React.ReactNode;
}
