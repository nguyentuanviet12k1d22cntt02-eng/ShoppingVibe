export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  status: 'active' | 'hidden';
}
