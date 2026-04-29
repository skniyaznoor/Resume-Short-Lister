"use client";

import { useState } from "react";
import { FileSearch, Info, Languages } from "lucide-react";
import { analyzeDocument, DocumentAnalysisResult } from "@/services/api";
import toast, { Toaster } from 'react-hot-toast';
import { HeroSection } from "@/components/HeroSection";
import { UploadArea } from "@/components/UploadArea";
import { AnalysisResults } from "@/components/AnalysisResults";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeDocument(file);
      setResult(data);
      toast.success("Document analyzed successfully!");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `Document Type: ${result.document_type}\nLanguage: ${result.detected_language}\n\nSummary:\n${result.summary}\n\nExtracted Text:\n${result.extracted_text}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis_${file?.name || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#050507] text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col">
      <Toaster position="bottom-right" />
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-20 border-b border-white/5 bg-[#050507]/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <FileSearch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Resume ShortLister AI
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Multilingual Document Analyzer</p>
          </div>
        </div>
      </header>

      <div className="flex-1 relative z-10 overflow-y-auto px-6 py-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <HeroSection />

          <UploadArea 
            file={file} 
            loading={loading} 
            result={result} 
            error={null} 
            onFileChange={handleFileChange} 
            onAnalyze={handleAnalyze} 
          />

          {/* Results Section */}
          {result && (
            <AnalysisResults result={result} onDownload={handleDownload} />
          )}

          {/* Features / Info Section (Empty State) */}
          {!result && !loading && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              {[
                {
                  icon: <FileSearch className="w-5 h-5 text-indigo-400" />,
                  title: "Smart OCR",
                  desc: "Supports printed and handwritten text using Transformer-based models for high-accuracy extraction."
                },
                {
                  icon: <Languages className="w-5 h-5 text-blue-400" />,
                  title: "Multilingual",
                  desc: "Supports Hindi and Odia via specialized translation pipelines (NLLB-200)."
                },
                {
                  icon: <Info className="w-5 h-5 text-purple-400" />,
                  title: "Instant Insights",
                  desc: "Get document classification and professional summaries in seconds, not minutes."
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                  <div className="p-2 w-fit bg-white/5 rounded-lg border border-white/10">
                    {feature.icon}
                  </div>
                  <h5 className="font-bold text-white">{feature.title}</h5>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      <footer className="relative z-20 border-t border-white/5 bg-[#050507]/60 backdrop-blur-xl px-6 py-6">
        <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          DocIntel AI • Built with PyMuPDF, Transformers & NLLB • © 2026
        </p>
      </footer>
    </main>
  );
}
