"use client";

import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Save, X } from 'lucide-react';
import { useUIStore } from '@/lib/store';

// Set up the worker via CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfExtractorProps {
  onClose: () => void;
  subject: string;
}

export function PdfExtractor({ onClose, subject }: PdfExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const { addNote } = useUIStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Extract from the first 50 pages maximum to prevent browser freeze
      const maxPages = Math.min(pdf.numPages, 50);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }
      
      setExtractedText(fullText);
    } catch (err) {
      console.error("PDF extraction failed", err);
      alert("Failed to parse PDF. Please try a different document.");
    } finally {
      setIsExtracting(false);
    }
  };

  const saveToNotes = () => {
    if (!extractedText) return;
    
    // Simple logic to split extract into a "Note"
    addNote({
      id: Date.now(),
      subject: subject,
      title: `Extracted: ${fileName}`,
      content: extractedText.slice(0, 1000) + (extractedText.length > 1000 ? "..." : "")
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-border/40 flex justify-between items-center bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-emerald-900 leading-tight">Textbook Parser</h2>
              <p className="text-xs text-muted-foreground">Extracting from: {subject}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {!fileName ? (
            <div className="border-2 border-dashed border-border/60 rounded-2xl p-10 text-center hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
              <input
                type="file"
                id="pdf-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-12 h-12 text-emerald-200 mb-4" />
                <p className="font-bold text-emerald-900 mb-1">Upload Study PDF</p>
                <p className="text-xs text-muted-foreground/80 lowercase">Select a textbook chapter (max 50 pages)</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-800 tracking-tight flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> {fileName}
                </p>
                {isExtracting && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Extracting...
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed font-mono max-h-[300px] overflow-y-auto border border-border/40">
                {extractedText ? extractedText.slice(0, 1500) + "..." : "Reading document..."}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#fafafa] border-t border-border/40 flex gap-3">
          <Button 
            className="flex-1 rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 font-bold"
            disabled={!extractedText || isExtracting}
            onClick={saveToNotes}
          >
            <Save className="w-4 h-4 mr-2" />
            Add to Study Notes
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl h-12 font-bold border-border/60"
            onClick={() => { setFileName(''); setExtractedText(''); }}
            disabled={!fileName || isExtracting}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
