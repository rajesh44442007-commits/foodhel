import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import AddProduct from './components/pages/AddProduct';
import Profile from './components/pages/Profile';
import AIAssistant from './components/pages/AIAssistant';
import BottomNav from './components/shared/BottomNav';
import { ThemeProvider } from './contexts/ThemeContext';
import { FoodItemsProvider } from './contexts/FoodItemsContext';

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('userEmail'));

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [userEmail]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
  };

  const handleLogout = () => {
    setUserEmail(null);
  };

  return (
    <ThemeProvider>
      <div className="font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        {!userEmail ? (
          <Login onLogin={handleLogin} />
        ) : (
          <FoodItemsProvider userEmail={userEmail}>
            <div className="relative pb-20 min-h-screen">
              <main className="p-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/add" element={<AddProduct />} />
                  <Route path="/assistant" element={<AIAssistant />} />
                  <Route path="/profile" element={<Profile onLogout={handleLogout} userEmail={userEmail} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
              <BottomNav />
            </div>
          </FoodItemsProvider>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;