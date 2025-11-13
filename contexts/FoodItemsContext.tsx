import React, { createContext, useState, useMemo, ReactNode, useContext, useEffect } from 'react';
import { FoodItem, Status } from '../types';
import { getStatusAndDays } from '../utils/dateUtils';

interface FoodItemsContextType {
  freshItems: FoodItem[];
  expiringSoonItems: FoodItem[];
  expiredItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'status' | 'daysRemaining'>) => void;
  deleteFoodItem: (id: string) => void;
}

const FoodItemsContext = createContext<FoodItemsContextType | undefined>(undefined);

export const FoodItemsProvider: React.FC<{ children: ReactNode; userEmail: string }> = ({ children, userEmail }) => {
  const storageKey = `foodItems_${userEmail}`;

  const [items, setItems] = useState<FoodItem[]>(() => {
    try {
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        // Re-hydrate dates from string format
        return JSON.parse(localData).map((item: Omit<FoodItem, 'expiryDate'> & { expiryDate: string }) => ({
          ...item,
          expiryDate: new Date(item.expiryDate),
        }));
      }
    } catch (error) {
      console.error("Failed to load food items from local storage", error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save food items to local storage", error);
    }
  }, [items, storageKey]);

  const addFoodItem = (item: Omit<FoodItem, 'id' | 'status' | 'daysRemaining'>) => {
    const { status, daysRemaining } = getStatusAndDays(item.expiryDate);
    const newItem: FoodItem = {
      ...item,
      id: crypto.randomUUID(),
      status,
      daysRemaining,
    };
    setItems(prevItems => [...prevItems, newItem].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()));
  };
  
  const deleteFoodItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const categorizedItems = useMemo(() => {
    const fresh: FoodItem[] = [];
    const expiring: FoodItem[] = [];
    const expired: FoodItem[] = [];

    items.forEach(item => {
      const refreshedItem = { ...item, ...getStatusAndDays(item.expiryDate) };
      switch (refreshedItem.status) {
        case Status.FRESH:
          fresh.push(refreshedItem);
          break;
        case Status.EXPIRING_SOON:
          expiring.push(refreshedItem);
          break;
        case Status.EXPIRED:
          expired.push(refreshedItem);
          break;
      }
    });
    return { fresh, expiring, expired };
  }, [items]);

  const value = {
    freshItems: categorizedItems.fresh,
    expiringSoonItems: categorizedItems.expiring,
    expiredItems: categorizedItems.expired,
    addFoodItem,
    deleteFoodItem,
  };

  return <FoodItemsContext.Provider value={value}>{children}</FoodItemsContext.Provider>;
};

export const useFoodItems = () => {
  const context = useContext(FoodItemsContext);
  if (context === undefined) {
    throw new Error('useFoodItems must be used within a FoodItemsProvider');
  }
  return context;
};