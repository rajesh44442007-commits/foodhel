
import { FoodItem, Category, Status } from './types';
import { getStatusAndDays } from './utils/dateUtils';

const today = new Date();
const createDate = (days: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

const createItem = (name: string, days: number, category: Category, imageUrl?: string): FoodItem => {
    const expiryDate = createDate(days);
    const { status, daysRemaining } = getStatusAndDays(expiryDate);
    return {
        id: crypto.randomUUID(),
        name,
        expiryDate,
        category,
        imageUrl,
        status,
        daysRemaining
    };
};

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
    createItem('Organic Milk', 5, Category.DAIRY, 'https://picsum.photos/400/300?image=1060'),
    createItem('Strawberries', 2, Category.FRUITS, 'https://picsum.photos/400/300?image=1080'),
    createItem('Chicken Breast', 1, Category.MEAT, 'https://picsum.photos/400/300?image=1069'),
    createItem('Spinach Bag', -1, Category.VEGETABLES, 'https://picsum.photos/400/300?image=1012'),
    createItem('Cheddar Cheese', 10, Category.DAIRY, 'https://picsum.photos/400/300?image=1078'),
    createItem('Yogurt', 0, Category.DAIRY, 'https://picsum.photos/400/300?image=776'),
    createItem('Apples', 14, Category.FRUITS, 'https://picsum.photos/400/300?image=664'),
    createItem('Bagels', -5, Category.PACKAGED, 'https://picsum.photos/400/300?image=431'),
];
