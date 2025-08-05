// src/components/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, disabled }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileChange(file);
    }
  }, [onFileChange]);

  const removeFile = () => {
    setSelectedFile(null);
    onFileChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled,
  });

  return (
    <div className="w-full">
      {selectedFile ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center gap-3">
            <FileIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground truncate">{selectedFile.name}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-auto p-1 text-muted-foreground hover:text-destructive"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-background/50'}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="w-8 h-8" />
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <div>
                <p className="font-semibold">Optional: Add context document</p>
                <p className="text-xs">Drag & drop or click to upload (PDF, DOCX, TXT)</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
