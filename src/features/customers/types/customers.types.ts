export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpend: number;
  ordersCount: number;
  joinDate: string;
  avatarBg: string;
  status: 'active' | 'inactive';
}
