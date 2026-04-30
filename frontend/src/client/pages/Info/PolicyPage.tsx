
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface CMSContent {
  title: string;
  content: string;
  last_updated: string;
}

const PolicyPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [data, setData] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Map URL types to DB slugs
  const slugMap: Record<string, string> = {
    'shipping': 'shipping-policy',
    'returns': 'returns-refunds',
    'privacy': 'privacy-policy',
    'terms': 'terms-service',
    'cookies': 'cookie-policy',
    'cookie': 'cookie-policy'
  };

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const slug = slugMap[type || ''] || type;
      try {
        const res = await fetch(`/api/cms/${slug}`);
        if (res.ok) {
          const content = await res.json();
          setData(content);
        } else {
          setData({ title: 'Page Not Found', content: '<p>The requested page could not be found.</p>', last_updated: new Date().toISOString() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [type]);

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link to="/" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline mb-8">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Home
      </Link>
      
      <div className="bg-white rounded-[40px] p-6 sm:p-16 border border-gray-100 shadow-sm animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-10">{data?.title}</h1>
        <div 
          className="prose prose-slate prose-lg max-w-none text-gray-600
          prose-headings:text-slate-900 prose-headings:font-bold
          prose-h3:text-xl prose-h3:mt-8
          prose-ul:list-disc prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: data?.content || '' }}
        />
      </div>
      
      <div className="mt-12 text-center text-gray-400 text-sm">
        Last updated: {data?.last_updated ? new Date(data.last_updated).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
};

export default PolicyPage;
