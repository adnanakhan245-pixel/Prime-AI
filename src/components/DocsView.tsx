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
  FileCheck,
  Lock,
  Clock,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserDocuments, saveDocument, deleteDocument } from '../services/db';
import { DocumentItem } from '../types';
import { ContractPaywallModal } from './ContractPaywallModal';

interface DocsViewProps {
  onUpgradeToPro?: () => void;
}

// Sample Pre-Loaded Contracts for Instant Demo & Evaluation
const SAMPLE_CONTRACTS: DocumentItem[] = [
  {
    id: 'sample_doc_1',
    userId: 'demo_user',
    title: 'Enterprise SaaS Master Services Agreement & SLA.pdf',
    fileType: 'application/pdf',
    fileSize: 245000,
    content: `MASTER SERVICES AGREEMENT (MSA) & SERVICE LEVEL AGREEMENT (SLA)
BETWEEN: Apex Tech Systems ("Vendor") AND Titan Global Holdings ("Client")
Effective Date: March 2026

1. SCOPE OF SERVICES: Vendor shall provide autonomous infrastructure and software services.
2. FEES & PAYMENT: Client agrees to pay $120,000 annually, billed quarterly in advance. Late payments incur 1.5% interest per month.
3. SERVICE LEVEL COMMITMENT (SLA): Vendor guarantees 99.99% monthly uptime. If uptime drops below 99.95%, Client is entitled to a 50% invoice penalty credit. If downtime exceeds 4 hours in a single calendar month, Client may terminate the agreement immediately with full refund of all prepaid fees for the entire contract term.
4. INDEMNIFICATION & LIABILITY: Vendor agrees to defend, indemnify, and hold harmless Client against any claims, losses, or legal fees. Vendor's total aggregate liability under this agreement SHALL BE UNLIMITED for any breaches of data security, confidentiality, or performance warranties.
5. TERMINATION FOR CONVENIENCE: Client may terminate this agreement at any time upon 14 days written notice with zero penalty and full pro-rata refund. Vendor must provide 180 days notice prior to termination.
6. GOVERNING LAW: This agreement shall be governed by the courts of Delaware.`,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    summary: 'High-risk commercial agreement containing severe unilateral liability traps, punitive SLA refund clauses, and asymmetric termination rights heavily favoring the client.',
    keyPoints: [
      'Annual contract value: $120,000 billed quarterly',
      'Unilateral 14-day termination for convenience allowed for client only',
      '99.99% uptime SLA with extreme penalty multipliers',
      'Unlimited liability uncapped for confidentiality and data claims'
    ],
    risks: [
      'RED FLAG: Unlimited aggregate liability clause creates catastrophic corporate exposure',
      'SLA PENALTY TRAP: 4 hours of cumulative downtime triggers full term refund of prepaid fees',
      'ASYMMETRIC TERMINATION: Client can walk away on 14 days notice, while vendor must give 180 days notice'
    ],
    nextActions: [
      'Strike clause 4 unlimited liability; cap total liability at 12 months fees paid ($120k)',
      'Renegotiate clause 3: Cap SLA service credit at 15% of monthly billing; remove entire term refund trigger',
      'Equalize termination notice to 60 days mutual notice'
    ],
    category: 'LEGAL'
  },
  {
    id: 'sample_doc_2',
    userId: 'demo_user',
    title: 'Freelance Custom Software Development Agreement.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 112000,
    content: `FREELANCE SOFTWARE DEVELOPMENT AGREEMENT
Client: Digital Ventures LLC | Developer: Full Stack Pro Agency
Project: AI Mobile & Web App MVP
Total Budget: $15,000 ($5,000 upfront deposit, $5,000 on beta milestone, $5,000 on final deployment)

Terms:
1. Intellectual property transfers immediately upon initial signing before milestone delivery.
2. Unlimited revisions within 90 days after delivery without additional charges.
3. Client holds sole discretion over milestone acceptance with no fixed review deadline.`,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    summary: 'Freelance contract with scope creep traps, premature IP transfer before full payment, and indefinite client acceptance loops.',
    keyPoints: [
      'Project Budget: $15,000 across 3 milestones',
      'IP transferred prior to final payment completion',
      'Unlimited revisions clause without hourly boundaries'
    ],
    risks: [
      'IP transferred before payment: Client can use code and refuse final $10,000 payments',
      'No acceptance deadline: Client can delay payment indefinitely without signing off',
      'Unlimited revisions causes project scope creep and margin loss'
    ],
    nextActions: [
      'Change IP transfer clause to "Transfers only upon receipt of 100% full cleared payment"',
      'Add 7-day deemed acceptance clause: If client does not reject in writing within 7 business days, milestone is automatically approved',
      'Limit revisions to 2 rounds per milestone; extra revisions billed at standard hourly rate'
    ],
    category: 'LEGAL'
  }
];

export const DocsView: React.FC<DocsViewProps> = ({ onUpgradeToPro }) => {
  const { user, profile, isPro, upgradeToPlan } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>(SAMPLE_CONTRACTS);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(SAMPLE_CONTRACTS[0]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [pasteText, setPasteText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Contract check paywall state
  const [showContractPaywall, setShowContractPaywall] = useState(false);
  const [checkCount, setCheckCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('prime_contract_checks_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      if (user) {
        const docs = await fetchUserDocuments(user.uid);
        if (docs && docs.length > 0) {
          setDocuments(docs);
          setSelectedDoc(docs[0]);
          return;
        }
      }
      setDocuments(SAMPLE_CONTRACTS);
      setSelectedDoc(SAMPLE_CONTRACTS[0]);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments(SAMPLE_CONTRACTS);
      setSelectedDoc(SAMPLE_CONTRACTS[0]);
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

  // Called when user clicks "Check Another Contract" or initiates a new check after initial checks
  const handleRequestNewCheck = (source: 'paste' | 'upload' | 'sample') => {
    const isPaidUser = isPro || localStorage.getItem('prime_contract_pro_unlocked') === 'true';
    if (!isPaidUser && checkCount >= 10) {
      setShowContractPaywall(true);
      return;
    }

    if (source === 'paste') {
      setShowPasteModal(true);
    } else if (source === 'upload') {
      fileInputRef.current?.click();
    }
  };

  const handleContinueFree = () => {
    setShowContractPaywall(false);
    showToast('Free check limit acknowledged (1 check/day).');
    setShowPasteModal(true);
  };

  const handleUpgradeToPro = async () => {
    try {
      localStorage.setItem('prime_contract_pro_unlocked', 'true');
      if (upgradeToPlan) {
        await upgradeToPlan('Pro', 'CARD');
      }
      setShowContractPaywall(false);
      showToast('🎉 Upgraded to Pro ($19/mo)! Unlimited contract checks & PDF export unlocked.');
      if (onUpgradeToPro) {
        onUpgradeToPro();
      }
    } catch (e) {
      localStorage.setItem('prime_contract_pro_unlocked', 'true');
      setShowContractPaywall(false);
      showToast('Pro features unlocked!');
    }
  };

  const handlePdfExport = () => {
    window.print();
  };

  const processAndAnalyzeDoc = async (title: string, content: string, fileType: string, fileSize: number) => {
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

      const docItem: DocumentItem = {
        id: 'doc_' + Date.now(),
        userId: user ? user.uid : 'guest_demo_user',
        title,
        fileType,
        fileSize,
        content,
        uploadedAt: new Date().toISOString(),
        summary: analysis.summary || 'Executive document analysis completed.',
        keyPoints: analysis.keyPoints || ['Strategic review executed.'],
        risks: analysis.risks || ['No critical red flags identified.'],
        nextActions: analysis.nextActions || ['Review findings with executive team.'],
        category: analysis.category || 'LEGAL'
      };

      if (user) {
        try {
          await saveDocument(docItem);
        } catch (saveErr) {
          console.warn('Could not persist to Firestore, stored locally in session:', saveErr);
        }
      }

      setDocuments(prev => [docItem, ...prev]);
      setSelectedDoc(docItem);

      // Increment check count
      const newCount = checkCount + 1;
      setCheckCount(newCount);
      try {
        localStorage.setItem('prime_contract_checks_count', newCount.toString());
      } catch {}

      showToast(`Document "${title}" analyzed in 30 seconds with Real AI!`);
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

    reader.readAsText(file);
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const title = docTitle.trim() || `Contract Audit - ${new Date().toLocaleDateString()}`;
    await processAndAnalyzeDoc(title, pasteText, 'text/plain', pasteText.length);
    setPasteText('');
    setDocTitle('');
    setShowPasteModal(false);
  };

  const handleSampleDoc = async (sampleType: 'SaaS Agreement' | 'Vendor SLA' | 'Quarterly Strategy') => {
    const isPaidUser = isPro || localStorage.getItem('prime_contract_pro_unlocked') === 'true';
    if (!isPaidUser && checkCount >= 1) {
      setShowContractPaywall(true);
      return;
    }

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
              PRIME <span className="text-[#FFD700] font-semibold">Contract Intelligence</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
              Free During Beta • 1st Check 100% Free
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Paste Your Contract. Find Where You'll Lose Money in 30 Seconds.
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

          {/* Primary Action 1: Paste Contract */}
          <button
            onClick={() => handleRequestNewCheck('paste')}
            className="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-yellow-300 text-black text-xs font-black shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Paste Contract (Free)</span>
          </button>

          <button
            onClick={() => handleRequestNewCheck('upload')}
            disabled={isUploading}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Analyzing...' : 'Upload PDF'}</span>
          </button>
        </div>
      </div>

      {/* Beta Status & Usage Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#FFD700]/5 to-zinc-900 border border-[#FFD700]/25 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#FFD700] text-black font-extrabold text-[10px] uppercase tracking-wider">
            Free During Beta
          </span>
          <span className="text-zinc-300 font-medium">
            {checkCount === 0 
              ? 'Your first full contract risk audit is 100% FREE. No card needed.' 
              : `You have completed ${checkCount} contract check(s).`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRequestNewCheck('paste')}
            className="px-3 py-1 rounded-lg bg-[#FFD700]/20 hover:bg-[#FFD700] text-[#FFD700] hover:text-black border border-[#FFD700]/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Check Another Contract</span>
          </button>
        </div>
      </div>

      {/* Sample Document Quick Starters */}
      <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-white/40 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" /> Test Sample Contracts in 30 Seconds:
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
                placeholder="Search analyzed contracts & redlines..."
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
              <div className="p-12 text-center text-white/30 text-xs space-y-3">
                <FileText className="w-8 h-8 mx-auto text-white/20" />
                <p>No contracts checked yet.</p>
                <button
                  onClick={() => handleRequestNewCheck('paste')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FFD700] text-black font-bold text-xs hover:bg-yellow-300 transition-colors cursor-pointer"
                >
                  Paste Your 1st Contract (Free)
                </button>
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
                      <span className="text-red-400 font-bold">{doc.risks?.length || 0} Risk Flags</span>
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
              {/* Header with Check Another Contract and PDF Export */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#FFD700]" />
                    <h2 className="text-base font-bold text-white">{selectedDoc.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-white/60 font-medium">
                      Category: {selectedDoc.category}
                    </span>
                    <span>Audit Time: 30s • {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Button: Check Another Contract -> Triggers Paywall if > 1 */}
                  <button
                    onClick={() => handleRequestNewCheck('paste')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFD700] hover:bg-yellow-300 text-black text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Check Another Contract</span>
                  </button>

                  {/* Button: PDF Export */}
                  <button
                    onClick={handlePdfExport}
                    className="p-2 rounded-lg text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                    title="Export Report to PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 1. EXECUTIVE SUMMARY */}
              <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Bottom-Line Financial & Liability Synthesis (100% Free Report)</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* 2. IDENTIFIED RISKS & WHERE YOU'LL LOSE MONEY */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Where You'll Lose Money / Hidden Penalties ({selectedDoc.risks?.length || 0})</span>
                </h3>
                <div className="space-y-2">
                  {selectedDoc.risks?.map((risk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-300 leading-relaxed">
                      <span className="text-red-400 shrink-0 font-bold">⚠️ Clause Risk #{idx + 1}:</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. KEY COMMERCIAL CLAUSES */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#FFD700]" />
                  <span>Analyzed Commercial Terms ({selectedDoc.keyPoints?.length || 0})</span>
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

              {/* 4. 3 COO DIRECT ACTIONS */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>Executive Actions & Redlines to Prevent Loss</span>
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
            <div className="p-16 text-center text-white/30 text-xs space-y-3">
              <FileText className="w-10 h-10 mx-auto text-[#FFD700]/40 mb-2" />
              <p className="font-bold text-white text-sm">Paste Your Contract. Find Where You'll Lose Money in 30 Seconds.</p>
              <p className="text-zinc-400 max-w-sm mx-auto">
                No credit card required. Get your full initial liability, penalty, and redline report 100% free.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleRequestNewCheck('paste')}
                  className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-black font-extrabold text-xs hover:bg-yellow-300 transition-all cursor-pointer shadow-md"
                >
                  Paste Contract Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paste Contract Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0E0E0E] border border-amber-500/30 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white mb-1">Paste Contract or Terms</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Paste your vendor proposal, NDA, master service agreement, or client contract for instant 30-second risk audit.
            </p>

            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Contract / Agreement Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement & SLA"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Contract Text</label>
                <textarea
                  required
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste clauses, payment terms, SLA conditions, or liability sections here..."
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
                  <span>{isUploading ? 'Auditing in 30s...' : 'Audit Contract in 30 Seconds'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Check Paywall Modal */}
      <ContractPaywallModal
        isOpen={showContractPaywall}
        onClose={() => setShowContractPaywall(false)}
        onContinueFree={handleContinueFree}
        onUpgradePro={handleUpgradeToPro}
      />
    </div>
  );
};

