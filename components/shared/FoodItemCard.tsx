import React from 'react';
import { FoodItem, Status } from '../../types';
import { useFoodItems } from '../../contexts/FoodItemsContext';
import { XIcon } from './Icons';

interface FoodItemCardProps {
  item: FoodItem;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item }) => {
  const { deleteFoodItem } = useFoodItems();
  
  const getStatusStyles = () => {
    switch (item.status) {
      case Status.FRESH:
        return {
          gradient: 'from-green-400/20 to-green-500/20',
          borderColor: 'border-green-400/50',
          textColor: 'text-green-400',
          indicatorBg: 'bg-green-400',
          daysText: 'Fresh',
        };
      case Status.EXPIRING_SOON:
        return {
          gradient: 'from-yellow-400/20 to-yellow-500/20',
          borderColor: 'border-yellow-400/50',
          textColor: 'text-yellow-400',
          indicatorBg: 'bg-yellow-400',
          daysText: `${item.daysRemaining} ${item.daysRemaining === 1 ? 'day' : 'days'} left`,
        };
      case Status.EXPIRED:
        return {
          gradient: 'from-red-400/20 to-red-500/20',
          borderColor: 'border-red-400/50',
          textColor: 'text-red-400',
          indicatorBg: 'bg-red-400',
          daysText: `Expired ${Math.abs(item.daysRemaining)} ${Math.abs(item.daysRemaining) === 1 ? 'day' : 'days'} ago`,
        };
      default:
        return {
          gradient: 'from-gray-400/20 to-gray-500/20',
          borderColor: 'border-gray-400/50',
          textColor: 'text-gray-400',
          indicatorBg: 'bg-gray-400',
          daysText: '',
        };
    }
  };

  const { gradient, borderColor, textColor, indicatorBg, daysText } = getStatusStyles();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click events
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
        deleteFoodItem(item.id);
    }
  };

  return (
    <div className={`relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg border ${borderColor} overflow-hidden transition-transform transform hover:scale-105 duration-300`}>
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 p-1.5 bg-gray-500/20 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-500/30 hover:text-red-500 transition-all"
        aria-label={`Delete ${item.name}`}
      >
        <XIcon className="w-4 h-4" />
      </button>
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradient.replace('/20', '/50')}`}></div>
      <div className="p-4 flex space-x-4">
        <img src={item.imageUrl || 'https://picsum.photos/400/300'} alt={item.name} className="w-24 h-24 rounded-lg object-cover border-2 border-white/20" />
        <div className="flex flex-col justify-between flex-1">
          <div>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-medium">{item.category}</span>
            <h3 className="text-lg font-bold mt-2 text-gray-800 dark:text-gray-100">{item.name}</h3>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expires: {item.expiryDate.toLocaleDateString()}
            </p>
            <div className={`flex items-center space-x-2 text-sm font-semibold ${textColor}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${indicatorBg}`}></div>
              <span>{daysText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;
