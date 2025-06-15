
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
  } | null;
}
