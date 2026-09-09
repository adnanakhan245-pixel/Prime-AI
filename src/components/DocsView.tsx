import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  ListChecks, 
  Layers, 
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserDocuments, saveDocument, deleteDocument } from '../services/db';
import { DocumentItem } from '../types';

export const DocsView: React.FC = () => {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [pasteText, setPasteText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const docs = await fetchUserDocuments(user.uid);
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
      } else if (selectedDoc) {
        const found = docs.find(d => d.id === selectedDoc.id);
        if (found) setSelectedDoc(found);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const processAndAnalyzeDoc = async (title: string, content: string, fileType: string, fileSize: number) => {
    if (!user) return;
    try {
      setIsUploading(true);
      const res = await fetch('/api/gemini/summarize-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          companyName: profile?.companyName || 'Apex Enterprises'
        })
      });

      const analysis = await res.json();

      const saved = await saveDocument({
        userId: user.uid,
        title,
        fileType,
        fileSize,
        content,
        uploadedAt: new Date().toISOString(),
        summary: analysis.summary || 'Executive document analysis completed.',
        keyPoints: analysis.keyPoints || ['Strategic review executed.'],
        risks: analysis.risks || ['No critical red flags identified.'],
        nextActions: analysis.nextActions || ['Review findings with executive team.'],
        category: analysis.category || 'STRATEGY'
      });

      await loadDocuments();
      setSelectedDoc(saved);
      showToast(`Document "${title}" analyzed with Gemini & saved to Firestore!`);
    } catch (err) {
      console.error('Error analyzing document:', err);
      showToast('Failed to analyze document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      await processAndAnalyzeDoc(
        file.name,
        text || `Binary Document Content (${file.name}, ${file.size} bytes). Analyzed for operational clauses.`,
        file.type || 'application/pdf',
        file.size
      );
    };

    if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      // For PDFs or other files, read as data text
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const title = docTitle.trim() || `Executive Memo - ${new Date().toLocaleDateString()}`;
    await processAndAnalyzeDoc(title, pasteText, 'text/plain', pasteText.length);
    setPasteText('');
    setDocTitle('');
    setShowPasteModal(false);
  };

  const handleSampleDoc = async (sampleType: 'SaaS Agreement' | 'Vendor SLA' | 'Quarterly Strategy') => {
    let sampleTitle = '';
    let sampleContent = '';

    if (sampleType === 'SaaS Agreement') {
      sampleTitle = 'Master SaaS Service Agreement (Enterprise $350k).pdf';
      sampleContent = `MASTER SERVICES AGREEMENT\nEffective Date: Q3 2026\nParties: Apex Enterprises & Global Logistics Corp\nContract Value: $350,000 Annual Recurring Revenue.\nSection 3: Payment terms Net 30 with 1.5% late interest clause.\nSection 4: Latency & SLA. Provider guarantees 99.9% uptime. Failure triggers 10% monthly credit refund.\nSection 8: Intellectual Property. Client retains all derivative data and custom workflow rights.\nSection 12: Termination for convenience requires 60 days written notice.\nImmediate Action: Validate compliance with Section 4 monitoring before signature.`;
    } else if (sampleType === 'Vendor SLA') {
      sampleTitle = 'Cloud GPU Cluster Vendor Agreement & Pricing Schedule.pdf';
      sampleContent = `INFRASTRUCTURE MASTER SERVICE SCHEDULE\nVendor: HyperScale Cloud Compute\nMonthly Baseline: $48,000 / month.\nDiscount structure: 24% discount if commitment extended to 24 months.\nPenalty: Overage costs bill at 1.8x standard spot rates if token concurrency exceeds 100k TPM.\nRisks: Spot instances subject to preemption during peak hours (10 AM - 2 PM EST).\nAction: Provision reserved concurrency pool to avoid spot surcharge.`;
    } else {
      sampleTitle = 'Q4 Operational Scaling & Headcount Expansion Strategy.pdf';
      sampleContent = `Q4 OPERATIONAL PLAN - EXPANSION BLUEPRINT\nTarget: Expand European Union operations.\nBudget Allocation: $1.2M across GTM and compliance.\nKey Deliverables:\n1. GDPR and EU AI Act conformity certification by end of month.\n2. Onboard 4 Solutions Engineers in London hub.\n3. Integrate multi-currency billing in EUR and GBP.\nBottleneck: Regulatory compliance review timeline estimated at 3 weeks.\nRecommendation: Fast-track external legal auditor and deploy automated EU telemetry.`;
    }

    await processAndAnalyzeDoc(sampleTitle, sampleContent, 'application/pdf', 1024 * 320);
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      showToast('Document deleted');
      await loadDocuments();
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-light text-white tracking-tight">
              PRIME <span className="text-[#FFD700] font-semibold">Documents Intelligence</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 font-medium font-mono">
              {documents.length} Strategic Documents
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Autonomous contract, financial, and strategic memo intelligence with Gemini 2.5 Flash.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt,.md,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#FFD700] transition-colors shadow-[0_0_15px_rgba(255,215,0,0.15)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Extracting with Gemini...' : 'Upload PDF / Doc'}</span>
          </button>
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Sample Document Quick Starters */}
      <div className="p-4 rounded-xl bg-[#161616] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-white/40 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" /> Test Instant Document Analysis:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSampleDoc('SaaS Agreement')}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            + Enterprise SaaS Contract ($350k)
          </button>
          <button
            onClick={() => handleSampleDoc('Vendor SLA')}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            + Cloud Infrastructure Pricing Agreement
          </button>
          <button
            onClick={() => handleSampleDoc('Quarterly Strategy')}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            + Q4 Scaling Strategy Memo
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Library (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#161616] border border-white/5 flex flex-col overflow-hidden shadow-xl">
          {/* Search and Category Filter */}
          <div className="p-3 bg-[#121212] border-b border-white/5 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search analyzed documents & summaries..."
                className="w-full bg-[#161616] border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {['ALL', 'FINANCIAL', 'LEGAL', 'OPERATIONS', 'STRATEGY'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    categoryFilter === cat ? 'bg-[#FFD700] text-black' : 'text-white/40 hover:text-white bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Doc List */}
          <div className="divide-y divide-white/5 max-h-[580px] overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center text-white/30 text-xs">
                No documents found. Upload a file or click one of the quick test templates above.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFD700]/10 border-l-4 border-[#FFD700]'
                        : 'hover:bg-white/[0.02] border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                        {doc.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                      {doc.summary}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/30 font-mono">
                      <span>{doc.keyPoints?.length || 0} Key Points • {doc.risks?.length || 0} Risks</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Executive Analysis View (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#161616] border border-white/5 p-6 overflow-hidden shadow-xl space-y-6">
          {selectedDoc ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#FFD700]" />
                    <h2 className="text-base font-semibold text-white">{selectedDoc.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-white/60 font-medium">
                      Category: {selectedDoc.category}
                    </span>
                    <span>Analyzed {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 1. EXECUTIVE SUMMARY */}
              <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Executive Bottom-Line Synthesis</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* 2. KEY STRATEGIC POINTS */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#FFD700]" />
                  <span>Key Points & Commercial Clauses ({selectedDoc.keyPoints?.length || 0})</span>
                </h3>
                <div className="space-y-2">
                  {selectedDoc.keyPoints?.map((point, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. RISKS & RED FLAGS */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Identified Risks & Operational Red Flags ({selectedDoc.risks?.length || 0})</span>
                </h3>
                <div className="space-y-2">
                  {selectedDoc.risks?.map((risk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300 leading-relaxed">
                      <span className="text-red-400 shrink-0 font-bold">•</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. 3 COO DIRECT ACTIONS */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>3 Direct Next Actions</span>
                </h3>
                <div className="space-y-2">
                  {selectedDoc.nextActions?.map((action, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#161616] border border-white/5 flex items-start gap-2.5 text-xs text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-white/30 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-white/20 mb-2" />
              <p className="font-semibold text-white/60">Select a document to review executive intelligence</p>
              <p>PRIME AI extracts core bottom-line numbers, risk factors, and next actions automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* Paste Text Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0E0E0E] border border-amber-500/30 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white mb-1">Paste Document or Executive Memo</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter raw text, board memo, SLA clause, or vendor proposal for instant Gemini analysis.
            </p>

            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Master SLA Agreement Q3 2026"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Document Content</label>
                <textarea
                  required
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste contract terms, executive email thread, board packet, or meeting transcript here..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black text-xs font-extrabold shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with PRIME</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
