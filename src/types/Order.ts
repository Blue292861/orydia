
export interface Order {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  price: number;
  status: 'pending' | 'processed';
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
    city: string | null;
    country: string | null;
  } | null;
  user_email?: string | null;
}
