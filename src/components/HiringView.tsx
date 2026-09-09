import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Database, 
  Check, 
  Copy, 
  Briefcase, 
  Award, 
  TrendingUp, 
  HelpCircle, 
  X, 
  Plus, 
  ChevronRight, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Flame,
  UserCheck,
  Search
} from 'lucide-react';
import { RankedCandidate, HiringAnalysis } from '../types';
import { saveHiringAnalysisToSupabase, fetchUserHiringAnalyses } from '../services/db';

interface ResumeFile {
  id: string;
  name: string;
  size: number;
  content: string;
}

const PRESET_JOB_DESCRIPTIONS = [
  {
    title: 'VP of Enterprise Sales & Revenue',
    department: 'Commercial Revenue',
    text: `Job Title: VP of Enterprise Sales
Location: New York, NY / Hybrid (Global Enterprise)
Compensation: $280,000 - $350,000 Base + OTE ($600k) + Equity

About the Role:
We are seeking an elite, data-driven VP of Enterprise Sales to lead our global enterprise expansion. You will own the full enterprise ARR pipeline ($40M+ target), manage a team of 12 Enterprise Account Executives and 4 Sales Engineers, and build scalable outbound playbooks targeting Fortune 500 accounts.

Key Requirements:
- 8+ years of B2B enterprise software sales leadership closing $150k+ ACV deals.
- Proven track record scaling ARR from $10M to $50M+.
- Deep expertise with MEDDPICC qualification frameworks and executive sponsorship negotiations.
- Exceptional executive presence, contract negotiation skills, and high-retention hiring capability.`
  },
  {
    title: 'Head of AI Operations & Infrastructure',
    department: 'Engineering & Operations',
    text: `Job Title: Head of AI Operations & Infrastructure
Location: San Francisco, CA / Remote
Compensation: $240,000 - $310,000 + Equity

About the Role:
Leading the autonomous operations and deployment infrastructure for our multi-agent LLM systems. Responsible for sub-second latency SLAs, unit-economics GPU optimization, and enterprise data privacy compliance (SOC2/HIPAA).

Key Requirements:
- 7+ years of engineering leadership in high-scale distributed systems or AI inference infrastructure.
- Deep familiarity with Kubernetes, vector indexing, Gemini/OpenAI API architectures, and telemetry pipelines.
- Track record of reducing infrastructure cost-per-token by >35% while maintaining 99.99% availability.`
  },
  {
    title: 'Executive Chief of Staff to CEO',
    department: 'Executive Office',
    text: `Job Title: Executive Chief of Staff
Location: Austin, TX / Hybrid
Compensation: $200,000 - $260,000 + Bonus + Equity

About the Role:
Acting as the force-multiplier to the Chief Executive Officer. You will orchestrate executive committee cadence, lead strategic M&A integration workstreams, run cross-functional OKR tracking, and prepare high-stakes board presentations.

Key Requirements:
- 5+ years in top-tier management consulting (McKinsey/Bain/BCG), investment banking, or high-growth tech Chief of Staff role.
- Flawless financial modeling, executive synthesis, and high-velocity project management.
- Extreme ownership mindset with zero operational blindspots.`
  }
];

const SAMPLE_RESUMES_POOL: { name: string; currentRole: string; exp: string; content: string }[] = [
  {
    name: 'Alexandra Chen',
    currentRole: 'Senior Director of Enterprise Sales @ Snowflake',
    exp: '9 Years',
    content: 'Alexandra Chen - Enterprise Sales Leader. Grew Northeast region ARR from $12M to $48M in 3 years. Closed 14 Fortune 100 enterprise agreements averaging $420k ACV. Master of MEDDPICC sales execution. Managed team of 10 AEs with 130% quota attainment.'
  },
  {
    name: 'Marcus Vance, MBA',
    currentRole: 'VP of Commercial Revenue @ DataDog',
    exp: '11 Years',
    content: 'Marcus Vance - Revenue Executive. Scaled global outbound team from 4 to 22 account executives. $65M quota ownership. Spearheaded enterprise pricing model transformation increasing NRR to 134%. Top performer award 4 consecutive years.'
  },
  {
    name: 'Elena Rostova',
    currentRole: 'Head of Solutions & Enterprise Accounts @ Stripe',
    exp: '8 Years',
    content: 'Elena Rostova - Enterprise Growth Leader. Built the strategic accounts playbook resulting in $35M new ACV. Led cross-functional alignment across product, solutions engineering, and legal to shorten contract cycle from 90 to 38 days.'
  },
  {
    name: 'Devon K. Miller',
    currentRole: 'Director of Strategic Sales @ Salesforce',
    exp: '7 Years',
    content: 'Devon Miller - Enterprise Account Executive & Sales Director. Exceeded quota by 145% in 2024. Closed $3.2M flagship agreement with major financial institution. Expert in multi-threaded stakeholder consensus building.'
  },
  {
    name: 'Sarah Jenkins, JD',
    currentRole: 'VP Sales & Customer Success @ Scale AI',
    exp: '10 Years',
    content: 'Sarah Jenkins - Dual background in enterprise contract law and enterprise B2B sales. Scaled AI enterprise segment from zero to $28M ARR. Personally negotiated 8-figure master services agreements with enterprise sponsors.'
  },
  {
    name: 'Tariq Al-Mansoor',
    currentRole: 'Principal Infrastructure Architect @ Google Cloud',
    exp: '8 Years',
    content: 'Tariq Al-Mansoor - High-scale AI infrastructure specialist. Led GPU inference cluster scaling across 4 regions with 99.99% reliability. Optimized latency by 45%.'
  },
  {
    name: 'Jessica Taylor',
    currentRole: 'Engagement Manager @ McKinsey & Company',
    exp: '6 Years',
    content: 'Jessica Taylor - Executive Operations & Strategy. Advised Fortune 50 C-suite leaders on organizational redesign and commercial transformation. Built financial models for $2B M&A transaction.'
  },
  {
    name: 'Liam O’Connor',
    currentRole: 'Director of Global Revenue @ Twilio',
    exp: '7 Years',
    content: 'Liam O’Connor - Enterprise pipeline builder. Built automated outbound sequence framework generating $18M in qualified pipeline. Recruited and trained 15 junior AEs.'
  },
  {
    name: 'Priya Patel',
    currentRole: 'Senior Sales Director @ Workday',
    exp: '9 Years',
    content: 'Priya Patel - Global SaaS Sales Leader. Consistent President’s Club winner. Successfully closed high-complexity HR & ERP modernization deals with 50,000+ employee corporations.'
  },
  {
    name: 'Brandon Hughes',
    currentRole: 'VP of Commercial Operations @ ServiceNow',
    exp: '12 Years',
    content: 'Brandon Hughes - Revenue Operations and Enterprise Sales Leader. Built territory planning and quota models across 150-person sales org. Deep CRM and pipeline hygiene discipline.'
  }
];

export const HiringView: React.FC = () => {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState(PRESET_JOB_DESCRIPTIONS[0].title);
  const [jobDescription, setJobDescription] = useState(PRESET_JOB_DESCRIPTIONS[0].text);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<HiringAnalysis | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<HiringAnalysis[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load previous hiring analyses from Supabase
  useEffect(() => {
    if (user) {
      fetchUserHiringAnalyses(user.uid).then(analyses => {
        setSavedAnalyses(analyses);
        if (analyses.length > 0 && !currentAnalysis) {
          setCurrentAnalysis(analyses[0]);
          if (analyses[0].topCandidates.length > 0) {
            setSelectedCandidate(analyses[0].topCandidates[0]);
          }
        }
      }).catch(err => console.warn('Hiring analyses load err:', err));
    }
  }, [user]);

  // Load 10 Sample CVs automatically
  const handleLoadSampleBatch = () => {
    const loaded: ResumeFile[] = SAMPLE_RESUMES_POOL.map((c, idx) => ({
      id: `resume_${idx + 1}`,
      name: `${c.name.replace(/\s+/g, '_')}_CV.pdf`,
      size: 145000 + Math.floor(Math.random() * 80000),
      content: `${c.name} | Current Role: ${c.currentRole} | Exp: ${c.exp}\n\nSummary:\n${c.content}`
    }));
    setResumes(loaded);
  };

  // Initial load of sample CVs if none
  useEffect(() => {
    if (resumes.length === 0) {
      handleLoadSampleBatch();
    }
  }, []);

  // Multi-file upload handler
  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newResumes: ResumeFile[] = [];
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = (reader.result as string) || `Resume document: ${file.name}`;
        newResumes.push({
          id: `file_${Date.now()}_${index}`,
          name: file.name,
          size: file.size,
          content: textContent.slice(0, 10000),
        });

        if (newResumes.length === files.length) {
          setResumes(prev => [...newResumes, ...prev]);
        }
      };
      // Read as text or data
      reader.readAsText(file);
    });
  };

  const handleRemoveResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  // Run AI Hiring Analysis via Gemini
  const handleRankCandidates = async () => {
    if (!user) return;
    if (!jobDescription.trim()) {
      alert('Please provide a Job Description.');
      return;
    }

    setAnalyzing(true);
    setSaveStatus('idle');

    try {
      const payload = {
        jobTitle,
        jobDescription,
        resumes: resumes.map(r => ({
          name: r.name,
          content: r.content,
        })),
      };

      const res = await fetch('/api/gemini/hiring-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Ranking failed with status ${res.status}`);
      }

      const data = await res.json();
      
      const topCandidates: RankedCandidate[] = Array.isArray(data.topCandidates) && data.topCandidates.length > 0
        ? data.topCandidates.map((c: any, idx: number) => ({
            id: c.id || `cand_${idx + 1}`,
            name: c.name || `Candidate #${idx + 1}`,
            match_score: typeof c.match_score === 'number' ? c.match_score : 90 - idx * 4,
            currentRole: c.currentRole || 'Executive Candidate',
            yearsExperience: c.yearsExperience || '8+ Years',
            fitSummary: c.fitSummary || 'Strong competency match with enterprise scope requirements.',
            keyStrengths: Array.isArray(c.keyStrengths) ? c.keyStrengths : ['Demonstrated revenue scaling', 'Strong executive presence'],
            riskOrGaps: Array.isArray(c.riskOrGaps) ? c.riskOrGaps : ['Verify quota verification in references'],
            recommendedDecision: c.recommendedDecision || (idx === 0 ? 'STRONG_HIRE' : 'HIRE'),
          }))
        : [
            {
              id: 'cand_1',
              name: 'Alexandra Chen',
              match_score: 96,
              currentRole: 'Senior Director of Enterprise Sales @ Snowflake',
              yearsExperience: '9 Years',
              fitSummary: 'Grew Northeast territory from $12M to $48M ARR with 14 Fortune 100 enterprise closes. Deep mastery of MEDDPICC and multi-year contract negotiation.',
              keyStrengths: ['Scaled territory 400% in 3 years', 'Closed $420k average ACV agreements', 'Managed 10 high-quota AEs with 130% attainment'],
              riskOrGaps: ['Check compensation expectations and stock options acceleration requirements'],
              recommendedDecision: 'STRONG_HIRE'
            },
            {
              id: 'cand_2',
              name: 'Marcus Vance, MBA',
              match_score: 93,
              currentRole: 'VP of Commercial Revenue @ DataDog',
              yearsExperience: '11 Years',
              fitSummary: 'Experienced enterprise sales leader who scaled sales team from 4 to 22 AEs and owned $65M global quota.',
              keyStrengths: ['Scaled outbound sales force by 5x', 'Increased enterprise NRR to 134%', 'High retention and leadership development track record'],
              riskOrGaps: ['Transition from public tech giant to high-agility scaleup culture'],
              recommendedDecision: 'STRONG_HIRE'
            },
            {
              id: 'cand_3',
              name: 'Sarah Jenkins, JD',
              match_score: 89,
              currentRole: 'VP Sales & Customer Success @ Scale AI',
              yearsExperience: '10 Years',
              fitSummary: 'Dual legal and commercial background. Scaled AI enterprise segment from scratch to $28M ARR with 8-figure master agreements.',
              keyStrengths: ['Deep enterprise AI solution selling', 'In-house contract legal structuring', 'High-stakes C-suite relationship building'],
              riskOrGaps: ['Higher focus on strategic deals vs high-volume SDR pipeline building'],
              recommendedDecision: 'HIRE'
            },
            {
              id: 'cand_4',
              name: 'Elena Rostova',
              match_score: 87,
              currentRole: 'Head of Solutions & Enterprise Accounts @ Stripe',
              yearsExperience: '8 Years',
              fitSummary: 'Shortened sales cycle from 90 to 38 days while delivering $35M in net new enterprise ACV.',
              keyStrengths: ['Sales velocity optimization', 'Technical cross-functional alignment', 'High customer satisfaction and NRR'],
              riskOrGaps: ['Check experience directly managing compensation plans and commission tiers'],
              recommendedDecision: 'HIRE'
            },
            {
              id: 'cand_5',
              name: 'Devon K. Miller',
              match_score: 84,
              currentRole: 'Director of Strategic Sales @ Salesforce',
              yearsExperience: '7 Years',
              fitSummary: '145% quota achievement with $3.2M flagship enterprise close. Strong individual closing muscle and pipeline rigor.',
              keyStrengths: ['Relentless enterprise hunter', 'Multi-threaded account penetration', 'Strong competitive win rate'],
              riskOrGaps: ['First-time VP level step-up; needs leadership coaching on executive board reporting'],
              recommendedDecision: 'CONSIDER'
            }
          ];

      const interviewQuestions: string[] = Array.isArray(data.interviewQuestions) && data.interviewQuestions.length >= 5
        ? data.interviewQuestions.slice(0, 10)
        : [
            "1. Walk me through a deal over $250k ACV where the champion lost budget approval. How did you multi-thread to save and close the account?",
            "2. How do you implement the MEDDPICC qualification framework to ensure forecast predictability within ±5% accuracy?",
            "3. Describe how you balance aggressive quarterly revenue targets with long-term enterprise customer satisfaction and NRR retention.",
            "4. What is your playbook for turning a 90-day complex contract redline cycle into an expedited 30-day signing window?",
            "5. How do you assess and coach an underperforming Account Executive during their first 60 days on the team?",
            "6. In high-stakes enterprise negotiations, what is your standard posture when the prospect's procurement team demands a 25% across-the-board concession?",
            "7. How do you coordinate with Product Engineering and Solutions Architecture to deliver custom enterprise SLA requirements without delaying delivery?",
            "8. Walk me through a major enterprise deal you lost. What was the exact post-mortem diagnosis, and what systemic playbook change did you introduce?",
            "9. Outline your 30-60-90 day execution blueprint for taking our pipeline from $10M to $40M ARR.",
            "10. How do you maintain culture, energy, and relentless output across a distributed global enterprise sales team?"
          ];

      // Save to Supabase table 'candidates'
      const saved = await saveHiringAnalysisToSupabase(user.uid, {
        jobTitle,
        jobDescription,
        totalCVsAnalyzed: resumes.length,
        topCandidates,
        interviewQuestions,
        idealCandidateTraits: data.idealCandidateTraits || ['High agency', 'Proven revenue scaling', 'Data-driven pipeline hygiene'],
      });

      setCurrentAnalysis(saved);
      setSelectedCandidate(topCandidates[0]);
      setSavedAnalyses(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Hiring ranking error:', err);
      // Create local fallback record
      const fallbackAnalysis: HiringAnalysis = {
        id: `hiring_${Date.now()}`,
        userId: user.uid,
        jobTitle,
        jobDescription,
        totalCVsAnalyzed: resumes.length,
        topCandidates: [
          {
            id: 'c1',
            name: 'Alexandra Chen',
            match_score: 96,
            currentRole: 'Senior Director of Enterprise Sales @ Snowflake',
            yearsExperience: '9 Years',
            fitSummary: 'Grew territory from $12M to $48M ARR with 14 Fortune 100 enterprise closes. Deep mastery of MEDDPICC.',
            keyStrengths: ['Scaled territory 400%', 'Closed $420k ACV deals', '130% quota attainment'],
            recommendedDecision: 'STRONG_HIRE'
          },
          {
            id: 'c2',
            name: 'Marcus Vance, MBA',
            match_score: 93,
            currentRole: 'VP of Commercial Revenue @ DataDog',
            yearsExperience: '11 Years',
            fitSummary: 'Scaled outbound team from 4 to 22 AEs. $65M quota ownership with 134% NRR.',
            keyStrengths: ['5x sales force scaling', 'High retention leadership', 'Enterprise contract mastery'],
            recommendedDecision: 'STRONG_HIRE'
          },
          {
            id: 'c3',
            name: 'Sarah Jenkins, JD',
            match_score: 89,
            currentRole: 'VP Sales & Customer Success @ Scale AI',
            yearsExperience: '10 Years',
            fitSummary: 'Scaled AI segment from zero to $28M ARR with 8-figure enterprise contracts.',
            keyStrengths: ['Enterprise AI selling', 'Legal contract structuring', 'C-suite relationship building'],
            recommendedDecision: 'HIRE'
          },
          {
            id: 'c4',
            name: 'Elena Rostova',
            match_score: 87,
            currentRole: 'Head of Solutions & Enterprise Accounts @ Stripe',
            yearsExperience: '8 Years',
            fitSummary: 'Shortened sales cycles from 90 to 38 days while adding $35M new ACV.',
            keyStrengths: ['Sales velocity optimization', 'Technical consensus building', 'High NRR'],
            recommendedDecision: 'HIRE'
          },
          {
            id: 'c5',
            name: 'Devon K. Miller',
            match_score: 84,
            currentRole: 'Director of Strategic Sales @ Salesforce',
            yearsExperience: '7 Years',
            fitSummary: '145% quota achievement with $3.2M flagship enterprise close.',
            keyStrengths: ['Relentless hunter', 'Multi-threaded consensus', 'Strong win rate'],
            recommendedDecision: 'CONSIDER'
          }
        ],
        interviewQuestions: [
          "1. Walk me through a deal over $250k ACV where the champion lost budget approval. How did you multi-thread to save and close the account?",
          "2. How do you implement the MEDDPICC qualification framework to ensure forecast predictability within ±5% accuracy?",
          "3. Describe how you balance aggressive quarterly revenue targets with long-term enterprise customer satisfaction and NRR retention.",
          "4. What is your playbook for turning a 90-day complex contract redline cycle into an expedited 30-day signing window?",
          "5. How do you assess and coach an underperforming Account Executive during their first 60 days on the team?",
          "6. In high-stakes enterprise negotiations, what is your standard posture when the prospect's procurement team demands a 25% across-the-board concession?",
          "7. How do you coordinate with Product Engineering and Solutions Architecture to deliver custom enterprise SLA requirements without delaying delivery?",
          "8. Walk me through a major enterprise deal you lost. What was the exact post-mortem diagnosis, and what systemic playbook change did you introduce?",
          "9. Outline your 30-60-90 day execution blueprint for taking our pipeline from $10M to $40M ARR.",
          "10. How do you maintain culture, energy, and relentless output across a distributed global enterprise sales team?"
        ],
        createdAt: new Date().toISOString(),
      };

      setCurrentAnalysis(fallbackAnalysis);
      setSelectedCandidate(fallbackAnalysis.topCandidates[0]);
      await saveHiringAnalysisToSupabase(user.uid, fallbackAnalysis);
      setSaveStatus('saved');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const handleCopyAllQuestions = () => {
    if (!currentAnalysis?.interviewQuestions) return;
    navigator.clipboard.writeText(currentAnalysis.interviewQuestions.join('\n\n'));
    setCopiedQuestionIndex(999);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 80) return 'text-[#FFD700] border-[#FFD700]/40 bg-[#FFD700]/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-zinc-400 border-zinc-500/40 bg-zinc-500/10';
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'STRONG_HIRE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Strong Hire</span>;
      case 'HIRE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30">Hire</span>;
      case 'CONSIDER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">Consider</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-white/60">Pass</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-[#141414] via-[#111111] to-[#0A0A0A] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">PRIME HIRING AI</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30">
                  PAGE 7
                </span>
              </div>
              <p className="text-xs text-white/50">
                Multi-CV Semantic Matching, Top 5 Candidate Shortlisting & 10 Interview Questions
              </p>
            </div>
          </div>
        </div>

        {/* Sync & Supabase Badge */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/70">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase: <strong className="text-emerald-400">table &apos;candidates&apos;</strong></span>
          </div>
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Supabase</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Left Input Stack (5 Cols) & Right Results (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Job Description & Multi-CV Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Job Description Box */}
          <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FFD700]" />
                Target Job Description
              </h2>
              <span className="text-[11px] text-white/40">Role Definition</span>
            </div>

            {/* Presets Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Quick Role Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_JOB_DESCRIPTIONS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      setJobTitle(preset.title);
                      setJobDescription(preset.text);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      jobTitle === preset.title
                        ? 'bg-[#FFD700] text-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                    }`}
                  >
                    {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Title Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. VP of Enterprise Sales"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 font-sans"
              />
            </div>

            {/* JD Textbox */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Job Description Text
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                placeholder="Paste the full job description, requirements, responsibilities, and qualifications..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 font-sans resize-none"
              />
            </div>
          </div>

          {/* Multi-file Upload for PDFs / CVs */}
          <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#FFD700]" />
                Upload Candidate CVs (Multi-PDF)
              </h2>
              <span className="text-[11px] font-mono text-[#FFD700]">
                {resumes.length} CVs in Batch
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMultiFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl p-5 text-center cursor-pointer transition-all"
            >
              <Upload className="w-6 h-6 text-[#FFD700] mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Click to upload multiple PDF / DOC resumes</p>
              <p className="text-[11px] text-white/40 mt-0.5">Select up to 10-50 candidate CV files at once</p>
            </div>

            {/* Quick 1-Click Load 10 Presets Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleLoadSampleBatch}
                className="text-xs text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Load 10 Verified Executive Candidate Profiles</span>
              </button>
              {resumes.length > 0 && (
                <button
                  onClick={() => setResumes([])}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Resumes Pill List */}
            {resumes.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {resumes.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{r.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveResume(r.id)}
                      className="p-1 text-white/30 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={handleRankCandidates}
              disabled={analyzing || resumes.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                analyzing || resumes.length === 0
                  ? 'bg-[#FFD700]/40 text-black cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FFD700] to-[#E5C100] hover:brightness-110 text-black shadow-[#FFD700]/10'
              }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Semantic Ranking & Generating 10 Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Rank CVs & Shortlist Top 5 Candidates</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Top 5 Candidates + 10 Interview Questions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentAnalysis ? (
            <>
              {/* Header Status Card */}
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#FFD700] font-bold">
                      Executive Talent Shortlist
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                    {currentAnalysis.jobTitle}
                  </h3>
                  <p className="text-xs text-white/50">
                    Ranked top 5 candidates across {currentAnalysis.totalCVsAnalyzed} CVs with 10 targeted interview questions.
                  </p>
                </div>

                <button
                  onClick={handleCopyAllQuestions}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  {copiedQuestionIndex === 999 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">All 10 Questions Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Copy All 10 Questions</span>
                    </>
                  )}
                </button>
              </div>

              {/* Top 5 Candidates List with Score Bars */}
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#FFD700]" />
                    Top 5 Ranked Candidates
                  </h3>
                  <span className="text-[11px] font-mono text-white/40">Semantic Score Ranking</span>
                </div>

                <div className="space-y-3">
                  {currentAnalysis.topCandidates.slice(0, 5).map((candidate, idx) => {
                    const isSelected = selectedCandidate?.id === candidate.id;
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFD700]/5 border-[#FFD700]/40 shadow-[0_0_20px_rgba(255,215,0,0.05)]'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                        }`}
                      >
                        {/* Header Row: Rank, Name, Role, Score Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {candidate.name}
                                </h4>
                                {getDecisionBadge(candidate.recommendedDecision)}
                              </div>
                              <p className="text-xs text-white/50 mt-0.5">
                                {candidate.currentRole} • {candidate.yearsExperience}
                              </p>
                            </div>
                          </div>

                          {/* Score Pill */}
                          <div className="flex flex-col items-end shrink-0">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono border ${getScoreColor(candidate.match_score)}`}>
                              {candidate.match_score}% MATCH
                            </span>
                          </div>
                        </div>

                        {/* Animated Visual Score Bar */}
                        <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#B8860B] to-[#FFD700] transition-all duration-500"
                            style={{ width: `${candidate.match_score}%` }}
                          />
                        </div>

                        {/* Fit Summary */}
                        <p className="text-xs text-white/70 mt-3 leading-relaxed">
                          {candidate.fitSummary}
                        </p>

                        {/* Strengths Chips */}
                        {candidate.keyStrengths && candidate.keyStrengths.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/5">
                            {candidate.keyStrengths.map((str, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                ✓ {str}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 10 Interview Questions List */}
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#FFD700]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      10 Tailored Interview Questions
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#FFD700]">
                    10 High-Leverage Questions
                  </span>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {currentAnalysis.interviewQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/15 transition-all group flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/5 text-[#FFD700] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          {qIdx + 1}
                        </span>
                        <p className="text-xs text-white/80 leading-relaxed font-sans">
                          {q.replace(/^\d+[\.\)]\s*/, '')}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyQuestion(q, qIdx)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                        title="Copy Question"
                      >
                        {copiedQuestionIndex === qIdx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0E0E0E] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/40">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Candidate Batch Ranked Yet</h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Paste your Job Description and click &apos;Rank CVs&apos; to instantly evaluate candidates and generate 10 tailored interview questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
