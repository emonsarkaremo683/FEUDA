
import React, { useState, useEffect } from 'react';

const offers = [
  "New Arrival for Your iPhone 17 Series",
  "FLASH SALE: 20% OFF Everything with code FEUDA20",
  "Free Express Shipping on Orders Over $50",
  "Buy 2 Get 1 Free on all Screen Protectors"
];

const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % offers.length);
    }, 3000); // Updates every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-700 via-purple-600 to-red-500 text-white overflow-hidden h-10 flex items-center relative z-[60]">
      <div className="w-full flex justify-center items-center px-4">
        <div className="relative w-full max-w-2xl h-6 overflow-hidden">
          {offers.map((offer, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
                i === index 
                  ? 'translate-y-0 opacity-100' 
                  : i < index 
                    ? '-translate-y-full opacity-0' 
                    : 'translate-y-full opacity-0'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold tracking-wide text-center truncate w-full">
                {offer} <span className="ml-2 underline cursor-pointer text-white/80 hover:text-white transition-colors">learn more &gt;</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right side static info - hidden on small mobile */}
      <div className="absolute right-4 text-[10px] font-bold text-gray-400 hidden sm:block">
        Bangladesh / EN
      </div>
    </div>
  );
};

export default AnnouncementBar;
