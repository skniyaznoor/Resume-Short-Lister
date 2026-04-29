import React from 'react';
import { CheckCircle2, Download, Type, Languages, FileUp } from 'lucide-react';
import { DocumentAnalysisResult } from '@/services/api';
import { DocumentChat } from './DocumentChat';

interface AnalysisResultsProps {
  result: DocumentAnalysisResult;
  onDownload: () => void;
}

export function AnalysisResults({ result, onDownload }: AnalysisResultsProps) {
  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-indigo-400" />
          <span>Analysis Complete</span>
        </h3>
        <button 
          onClick={onDownload}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meta Info */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-slate-400">
              <Type className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Document Type</span>
            </div>
            <div className="text-2xl font-bold text-white">{result.document_type}</div>
          </div>

          <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-slate-400">
              <Languages className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Detected Language</span>
            </div>
            <div className="text-2xl font-bold text-white uppercase">{result.detected_language}</div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-4 flex-1">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Flan-T5 Local Summary</span>
            <p className="text-lg text-white leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Extracted Text */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FileUp className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-lg font-bold text-white">Extracted Content</h4>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Raw OCR Output</span>
        </div>
        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {result.extracted_text}
          </p>
        </div>
      </div>

      {/* Interactive Chat */}
      <DocumentChat extractedText={result.extracted_text} />
    </section>
  );
}
