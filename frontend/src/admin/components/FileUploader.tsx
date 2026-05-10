
import React, { useState, useId } from 'react';
import { API_BASE_URL } from '../../config';

interface FileUploaderProps {
  token: string | null;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ token, onUploadSuccess, label = "Upload File" }) => {
  const [uploading, setUploading] = useState(false);
  const uniqueId = useId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file); // Field name expected by server is 'image'

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onUploadSuccess(data.imageUrl);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id={uniqueId}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,video/*"
      />
      <label
        htmlFor={uniqueId}
        className={`inline-block px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-purple-600 hover:text-white transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {uploading ? 'Uploading...' : label}
      </label>
    </div>
  );
};

export default FileUploader;
