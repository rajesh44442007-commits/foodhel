import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { BarcodeScannerIcon, PaperAirplaneIcon, XIcon } from '../shared/Icons';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI Food Assistant. Scan a product barcode or ask me anything about food.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chat = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chat.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are an expert AI food assistant. Provide helpful, concise information about food items including nutritional facts, storage tips, and interesting trivia. Keep your answers friendly and easy to understand.'
          },
        });
      } catch (e) {
        console.error("Failed to initialize AI Assistant", e);
        setChatHistory(prev => [...prev, { role: 'model', text: 'Sorry, I am unable to connect to my brain right now. Please check the API key and refresh.'}]);
      }
    };
    initChat();
    return () => {
      stopScan();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access the camera. Please ensure you have granted permission.');
    }
  };

  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleSimulatedScan = () => {
    stopScan();
    const mockProduct = 'Organic Banana';
    const userMessage: ChatMessage = { role: 'user', text: `(Scanned Product) Tell me about: ${mockProduct}` };
    setChatHistory(prev => [...prev, userMessage]);
    sendMessageToAI(userMessage.text);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setChatHistory(prev => [...prev, userMessage]);
    sendMessageToAI(userInput);
    setUserInput('');
  };

  const sendMessageToAI = async (message: string) => {
    if (!chat.current) {
       setChatHistory(prev => [...prev, { role: 'model', text: 'Chat not initialized.'}]);
       return;
    }

    setIsLoading(true);
    
    try {
      let fullResponse = '';
      const result = await chat.current.sendMessageStream({ message });
      
      // Add a placeholder for the streaming response
      setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        fullResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = fullResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      setChatHistory(prev => [...prev, { role: 'model', text: 'Oops! Something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ScannerOverlay = () => (
    <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4">
        <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full object-cover" />
        <div className="relative z-10 w-full max-w-md h-48 border-4 border-dashed border-white/50 rounded-lg flex items-center justify-center">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 animate-pulse"></div>
        </div>
        <p className="text-white text-lg mt-4 z-10 font-medium">Align barcode within the frame</p>
        <div className="flex items-center space-x-4 mt-8 z-10">
            <button onClick={stopScan} className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg shadow-lg backdrop-blur-sm">
                Cancel
            </button>
            <button onClick={handleSimulatedScan} className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg">
                Simulate Scan
            </button>
        </div>
    </div>
  );

  return (
    <>
      {isScanning && <ScannerOverlay />}
      <div className="flex flex-col h-[calc(100vh-8.5rem)]">
        <header className="mb-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">AI Food Assistant</h1>
            <p className="text-gray-500 dark:text-gray-400">Your smart guide to food.</p>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-green-500 text-white rounded-br-none' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.text || ' '}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="max-w-xs p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                 <div className="flex items-center space-x-2">
                   <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                   <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                   <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                 </div>
               </div>
             </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
           <button 
             onClick={startScan}
             className="w-full flex items-center justify-center py-3 px-4 mb-4 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors font-medium"
           >
             <BarcodeScannerIcon className="w-6 h-6 mr-3"/>
             Scan a Product Barcode
           </button>
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about food..."
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="p-3 text-white bg-green-500 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform enabled:hover:scale-110 transition-all"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-6 h-6 transform -rotate-45" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;