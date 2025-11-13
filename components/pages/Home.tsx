
import React, { useState, useMemo, useEffect } from 'react';
import { useFoodItems } from '../../contexts/FoodItemsContext';
import { FoodItem, Status } from '../../types';
import FoodItemCard from '../shared/FoodItemCard';
import { useNavigate } from 'react-router-dom';
import { PlusCircleIcon } from '../shared/Icons';

type Tab = Status | 'All';

const Home: React.FC = () => {
  const { freshItems, expiringSoonItems, expiredItems } = useFoodItems();
  const [activeTab, setActiveTab] = useState<Tab>(Status.EXPIRING_SOON);
  const navigate = useNavigate();

  const allItems = useMemo(() => [...expiringSoonItems, ...freshItems, ...expiredItems], [freshItems, expiringSoonItems, expiredItems]);

  const itemsToDisplay = useMemo(() => {
    switch (activeTab) {
      case Status.FRESH:
        return freshItems;
      case Status.EXPIRING_SOON:
        return expiringSoonItems;
      case Status.EXPIRED:
        return expiredItems;
      case 'All':
        return allItems;
    }
  }, [activeTab, freshItems, expiringSoonItems, expiredItems, allItems]);
  
  useEffect(() => {
    const expiringSoonCount = expiringSoonItems.length;
    if (expiringSoonCount > 0) {
        // Simple alert to simulate local notification
        console.log(`Reminder: You have ${expiringSoonCount} item(s) expiring soon.`);
    }
  }, [expiringSoonItems]);

  const TabButton = ({ tab, count, label }: { tab: Tab; count: number; label: string }) => {
    const isActive = activeTab === tab;
    const baseClasses = 'px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
    const activeClasses = 'bg-green-500 text-white shadow-md';
    const inactiveClasses = 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600';
    return (
      <button onClick={() => setActiveTab(tab)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {label} <span className={`ml-2 inline-block px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white text-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>{count}</span>
      </button>
    );
  };
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Pantry</h1>
        <p className="text-gray-500 dark:text-gray-400">Keep track of your food's freshness.</p>
      </header>
      
      <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
        <TabButton tab={Status.EXPIRING_SOON} count={expiringSoonItems.length} label="Expiring" />
        <TabButton tab={Status.FRESH} count={freshItems.length} label="Fresh" />
        <TabButton tab={Status.EXPIRED} count={expiredItems.length} label="Expired" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itemsToDisplay.length > 0 ? (
          itemsToDisplay.map(item => <FoodItemCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No items in this category.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        aria-label="Add new food item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default Home;
