
export enum Category {
  DAIRY = 'Dairy',
  FRUITS = 'Fruits',
  VEGETABLES = 'Vegetables',
  PACKAGED = 'Packaged',
  MEAT = 'Meat',
  OTHER = 'Other',
}

export enum Status {
  FRESH = 'Fresh',
  EXPIRING_SOON = 'Expiring Soon',
  EXPIRED = 'Expired',
}

export interface FoodItem {
  id: string;
  name: string;
  expiryDate: Date;
  category: Category;
  imageUrl?: string;
  status: Status;
  daysRemaining: number;
}
