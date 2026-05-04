
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const { announcements } = useApp();

  const activeAnnouncements = announcements && announcements.length > 0 ? announcements : [];

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % activeAnnouncements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-purple-600 to-red-500 text-white overflow-hidden h-10 flex items-center relative z-[60]">
      <div className="w-full flex justify-center items-center px-4">
        <div className="relative w-full max-w-2xl h-6 overflow-hidden">
          {activeAnnouncements.map((announcement, i) => (
            <div
              key={announcement.id || i}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${i === index
                  ? 'translate-y-0 opacity-100'
                  : i < index
                    ? '-translate-y-full opacity-0'
                    : 'translate-y-full opacity-0'
                }`}
            >
              <span className="text-xs sm:text-sm font-bold tracking-wide text-center truncate w-full">
                {announcement.message} 
                {announcement.url && (
                  <Link to={announcement.url} className="ml-2 underline cursor-pointer text-white/80 hover:text-white transition-colors">
                    learn more &gt;
                  </Link>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
