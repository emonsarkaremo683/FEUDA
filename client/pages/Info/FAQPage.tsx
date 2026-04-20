
import React, { useEffect, useState } from 'react';

const FAQPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/faq')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pb-40">
      <h1 className="text-4xl sm:text-5xl font-black text-center text-slate-900 mb-16">{data?.title || 'Frequently Asked Questions'}</h1>
      <div className="bg-white rounded-[40px] p-8 sm:p-16 border border-gray-100 shadow-sm animate-fade-in sm:text-lg">
        {data ? (
          <div 
            className="prose prose-slate prose-lg max-w-none text-gray-600
            prose-headings:text-slate-900 prose-headings:font-bold
            prose-h3:text-xl prose-h3:mt-8
            prose-ul:list-disc prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: data.content }} 
          />
        ) : (
          <p className="text-center text-gray-400">No FAQ content available.</p>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
