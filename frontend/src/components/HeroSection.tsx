import React from 'react';

export function HeroSection() {
  return (
    <section className="text-center space-y-6">
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium animate-fade-in">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span>OCR & Translation Engine Active</span>
      </div>
      <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
        Understand any <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">document.</span>
      </h2>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Upload images, PDFs, or Word docs. Our AI extracts text, detects language, summarizes, and classifies automatically.
      </p>
    </section>
  );
}
