import React, { useState, useRef, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { CameraIcon } from '../shared/Icons';
import { GoogleGenAI, Type } from '@google/genai';

interface ProfileProps {
  onLogout: () => void;
  userEmail: string;
}

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
};


const Profile: React.FC<ProfileProps> = ({ onLogout, userEmail }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const profileStorageKey = `profile_${userEmail}`;
    
    // State for profile editing, initialized from localStorage
    const [name, setName] = useState(() => {
        try {
            const storedProfile = localStorage.getItem(profileStorageKey);
            return storedProfile ? JSON.parse(storedProfile).name : 'Demo User';
        } catch {
            return 'Demo User';
        }
    });
    const [avatar, setAvatar] = useState(() => {
        try {
            const storedProfile = localStorage.getItem(profileStorageKey);
            return storedProfile ? JSON.parse(storedProfile).avatar : 'https://picsum.photos/200';
        } catch {
            return 'https://picsum.photos/200';
        }
    });
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const profileFileInputRef = useRef<HTMLInputElement>(null);


    // State for AI Camera Check
    const [aiImage, setAiImage] = useState<File | null>(null);
    const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [freshnessStatus, setFreshnessStatus] = useState<'Fresh' | 'Spoiled' | null>(null);
    const [aiItemName, setAiItemName] = useState<string | null>(null);
    const aiFileInputRef = useRef<HTMLInputElement>(null);

    const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        const newAvatar = profileImagePreview || avatar;
        const profileData = { name, avatar: newAvatar };
        try {
            localStorage.setItem(profileStorageKey, JSON.stringify(profileData));
            setAvatar(newAvatar);
            if (profileImagePreview) {
                setProfileImagePreview(null);
            }
            alert('Profile saved successfully!');
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert('Could not save profile. Storage may be full.');
        }
    };
    
    const handleAiImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAiResult(null);
        setAiError(null);
        setFreshnessStatus(null);
        setAiItemName(null);
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAiImage(file);
          setAiImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!aiImage) {
          setAiError("Please select an image first.");
          return;
        }
    
        setIsAnalyzing(true);
        setAiResult(null);
        setAiError(null);
        setFreshnessStatus(null);
        setAiItemName(null);
    
        try {
          const base64Image = await fileToBase64(aiImage);
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: aiImage.type,
                    data: base64Image,
                  },
                },
                {
                  text: 'Analyze the food item in this image. First, identify the food item (e.g., "banana", "lettuce"). Second, determine if it is fresh or spoiled. Provide the result as a JSON object with three keys: "itemName" (string), "freshness" (string, either "Fresh" or "Spoiled"), and "analysis" (string, a brief one-sentence explanation).',
                },
              ],
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  itemName: {
                    type: Type.STRING,
                    description: 'The name of the food item identified in the image. e.g., "Banana", "Slice of Bread".',
                  },
                  freshness: {
                    type: Type.STRING,
                    description: 'The freshness status, either "Fresh" or "Spoiled".',
                  },
                  analysis: {
                    type: Type.STRING,
                    description: 'A brief one-sentence explanation of the freshness assessment.',
                  },
                },
                required: ['itemName', 'freshness', 'analysis'],
              },
            }
          });
    
          const resultJson = JSON.parse(response.text);
          
          setAiItemName(resultJson.itemName);
          setAiResult(resultJson.analysis);
          setFreshnessStatus(resultJson.freshness);
    
        } catch (err) {
          console.error(err);
          setAiError("Failed to analyze image. Please try again.");
        } finally {
          setIsAnalyzing(false);
        }
    };

    const getResultColor = () => {
        if (aiError) return 'border-red-500/50 bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
        if (!freshnessStatus) return 'border-blue-500/50 bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
        if (freshnessStatus.toLowerCase() === 'spoiled') return 'border-red-500/50 bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
        if (freshnessStatus.toLowerCase() === 'fresh') return 'border-green-500/50 bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
        return 'border-gray-500/50 bg-gray-100/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200';
    };


    return (
        <div className="max-w-lg mx-auto pb-4">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Profile & Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences.</p>
            </header>

            <div className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <img 
                            src={profileImagePreview || avatar} 
                            alt="User avatar" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-green-400 shadow-md"
                        />
                        <button 
                            onClick={() => profileFileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Change profile photo"
                        >
                            Change
                        </button>
                        <input 
                            type="file" 
                            ref={profileFileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleProfilePhotoChange} 
                        />
                    </div>
                    <div className="mt-4 w-full">
                         <label htmlFor="name" className="sr-only">Name</label>
                         <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-center bg-transparent text-2xl font-bold p-2 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                         />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{userEmail}</p>
                </div>
                
                <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Theme</span>
                        <div className="flex items-center rounded-full p-1 bg-gray-200 dark:bg-gray-700">
                            <button
                                onClick={() => theme === 'dark' && toggleTheme()}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                                    theme === 'light'
                                        ? 'bg-white text-gray-800 shadow-md'
                                        : 'bg-transparent text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                Light
                            </button>
                            <button
                                onClick={() => theme === 'light' && toggleTheme()}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                                    theme === 'dark'
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-transparent text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Camera Section */}
                <div className="w-full pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 text-left">
                    <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">AI Freshness Check</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quickly check if a food item is fresh or spoiled.</p>
                    <label htmlFor="ai-camera-input" className="cursor-pointer block">
                        {aiImagePreview ? (
                            <img src={aiImagePreview} alt="AI Check Preview" className="w-full h-48 object-cover rounded-lg" />
                        ) : (
                            <div className="w-full h-48 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                                <CameraIcon className="w-12 h-12 mb-2" />
                                <span>Tap to Upload or Capture</span>
                            </div>
                        )}
                    </label>
                    <input id="ai-camera-input" type="file" accept="image/*" capture="environment" className="hidden" ref={aiFileInputRef} onChange={handleAiImageChange} />
                    
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={!aiImage || isAnalyzing}
                        className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Freshness'}
                    </button>

                    {(aiResult || aiError) && (
                        <div className={`p-4 rounded-lg border text-center ${getResultColor()}`}>
                            {aiError ? (
                                <p>Error: {aiError}</p>
                            ) : (
                                <>
                                    {aiItemName && freshnessStatus && (
                                        <div className="flex justify-center items-center gap-2 mb-2">
                                            <p className="font-bold text-lg">{aiItemName}</p>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                freshnessStatus === 'Fresh'
                                                    ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                                                    : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                                            }`}>
                                                {freshnessStatus}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-sm">{aiResult}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>


                <div className="flex flex-col space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={handleSaveChanges}
                        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300">
                        Save Changes
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full text-center text-red-500 dark:text-red-400 font-semibold p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;