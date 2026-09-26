import { useState, useRef } from 'react';
import { getIcon } from '../utils/icons';
import { useJourney } from '../context/JourneyContext';
import { InlineNotice } from './InlineNotice';

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const UploadBox = ({ onUploadComplete, journeyId, multiple = false }) => {
  const { uploadPhoto } = useJourney();
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          setNotice({
            type: 'warning',
            title: 'Unsupported file skipped',
            message: 'Only image and video files are supported.'
          });
          continue;
        }
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
          setNotice({
            type: 'warning',
            title: 'File is too large',
            message: `${file.name} is larger than 20MB. Please choose a smaller file.`
          });
          continue;
        }
        const url = await uploadPhoto(journeyId, file);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        if (multiple) {
          onUploadComplete(urls);
        } else {
          onUploadComplete(urls[0]);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setNotice({
        type: 'error',
        title: 'Upload failed',
        message: 'Could not upload your memories. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
        isDragActive 
          ? 'border-theme-primary bg-theme-primary/10' 
          : 'border-theme-border bg-theme-bg/30 hover:border-theme-primary hover:bg-theme-bg/55'
      }`}
      onClick={onButtonClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        multiple={multiple}
        onChange={handleChange}
        disabled={uploading}
      />
      
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-theme-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-theme-text">Uploading memories...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-primary/10 text-theme-primary animate-pulse-slow">
            {getIcon('upload', { size: 20 })}
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-text">
              Drag & Drop your photos or videos here, or <span className="text-theme-primary underline">browse</span>
            </p>
            <p className="mt-1 text-xs text-theme-muted">
              Supports PNG, JPG, MP4, MOV up to 20MB
            </p>
          </div>
        </div>
      )}
      {notice && (
        <div className="mt-4 w-full" onClick={(event) => event.stopPropagation()}>
          <InlineNotice
            notice={notice}
            onDismiss={() => setNotice(null)}
            className="text-left"
          />
        </div>
      )}
    </div>
  );
};
