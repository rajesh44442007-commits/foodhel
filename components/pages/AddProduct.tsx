import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoodItems } from '../../contexts/FoodItemsContext';
import { Category } from '../../types';
import { CameraIcon } from '../shared/Icons';
import { GoogleGenAI, Type } from '@google/genai';

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const AddProduct: React.FC = () => {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freshnessStatus, setFreshnessStatus] = useState<'Fresh' | 'Spoiled' | null>(null);


  const navigate = useNavigate();
  const { addFoodItem } = useFoodItems();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiResult(null);
    setError(null);
    setFreshnessStatus(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);
    setError(null);
    setFreshnessStatus(null);

    try {
      const base64Image = await fileToBase64(image);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: image.type,
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

      setName(resultJson.itemName);
      setAiResult(resultJson.analysis);
      setFreshnessStatus(resultJson.freshness);

    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && expiryDate) {
      addFoodItem({
        name,
        expiryDate: new Date(expiryDate),
        category,
        imageUrl: imagePreview || undefined,
      });
      navigate('/');
    }
  };
  
  const getResultColor = () => {
    if (error) return 'border-red-500/50 bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    if (!freshnessStatus) return 'border-blue-500/50 bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    if (freshnessStatus.toLowerCase() === 'spoiled') return 'border-red-500/50 bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    if (freshnessStatus.toLowerCase() === 'fresh') return 'border-green-500/50 bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    return 'border-gray-500/50 bg-gray-100/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-lg mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add New Item</h1>
        <p className="text-gray-500 dark:text-gray-400">Enter details and analyze freshness with AI.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <label htmlFor="product-image" className="cursor-pointer block">
                {imagePreview ? (
                    <img src={imagePreview} alt="Product Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                    <div className="w-full h-48 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                        <CameraIcon className="w-12 h-12 mb-2" />
                        <span>Upload or Capture Photo</span>
                    </div>
                )}
            </label>
            <input id="product-image" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
            
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing}
              className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Freshness with AI'}
            </button>

            {(aiResult || error) && (
              <div className={`p-3 rounded-lg border text-sm text-center ${getResultColor()}`}>
                {error ? `Error: ${error}` : aiResult}
              </div>
            )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Organic Milk" className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
          <input type="date" id="expiryDate" value={expiryDate} min={today} onChange={e => setExpiryDate(e.target.value)} required className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} required className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="flex space-x-4 pt-4">
            <button type="button" onClick={() => navigate('/')} className="w-full py-3 px-4 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300">
                Cancel
            </button>
            <button type="submit" className="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300">
                Save Item
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;