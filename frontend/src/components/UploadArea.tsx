import React, { useRef } from 'react';
import { FileText, Upload, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadAreaProps {
  file: File | null;
  loading: boolean;
  result: any;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
}

export function UploadArea({ file, loading, result, error, onFileChange, onAnalyze }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="max-w-2xl mx-auto">
      <div 
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          "border-2 border-dashed rounded-[2.5rem] p-10 text-center",
          file ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/10 hover:border-white/20 bg-white/5"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          accept=".pdf,.docx,.jpg,.jpeg,.png"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-500">
            {file ? (
              <FileText className="w-8 h-8 text-indigo-400" />
            ) : (
              <Upload className="w-8 h-8 text-slate-500" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {file ? file.name : "Choose a file or drag & drop"}
            </h3>
            <p className="text-sm text-slate-500">
              PDF, DOCX, JPG, or PNG (up to 10MB)
            </p>
          </div>

          {file && !loading && !result && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center space-x-2 mx-auto"
            >
              <span>Analyze Document</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {loading && (
            <div className="mt-4 flex items-center justify-center space-x-3 text-indigo-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">AI is processing...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Fallback inline error if toast is missed, or we could rely purely on toast */}
    </section>
  );
}
