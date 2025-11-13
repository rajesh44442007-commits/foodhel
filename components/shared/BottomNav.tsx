import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, UserIcon, AssistantIcon } from './Icons';

const BottomNav: React.FC = () => {
    const activeLinkClass = "text-green-500";
    const inactiveLinkClass = "text-gray-400 group-hover:text-green-500 dark:text-gray-500 dark:group-hover:text-green-400";

    const NavItem = ({ to, icon: Icon, label }: { to: string, icon: React.FC<{className?: string}>, label: string }) => (
        <NavLink to={to} className={({ isActive }) => `flex flex-col items-center justify-center w-full group transition-transform transform active:scale-95 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
             {({ isActive }) => (
                <>
                    <Icon className={`w-7 h-7 mb-1 transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`} />
                    <span className="text-xs font-medium">{label}</span>
                </>
             )}
        </NavLink>
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-t-lg flex justify-around items-center z-50">
      <NavItem to="/" icon={HomeIcon} label="Home" />
      <NavItem to="/add" icon={PlusCircleIcon} label="Add" />
      <NavItem to="/assistant" icon={AssistantIcon} label="Assistant" />
      <NavItem to="/profile" icon={UserIcon} label="Profile" />
    </nav>
  );
};

export default BottomNav;