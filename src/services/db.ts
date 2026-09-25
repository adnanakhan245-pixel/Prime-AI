import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  EmailItem, 
  DocumentItem, 
  ChatMessage, 
  ActivityItem, 
  KPISummary, 
  CallRecord, 
  HiringAnalysis, 
  RankedCandidate,
  MeetingRecord,
  MeetingActionItem,
  MeetingDraftEmail,
  GrowthAuditRecord,
  GrowthLever,
  GrowthActionPlanItem,
  StrategyRecord,
  StrategyPlan,
  Company,
  BriefingRecord,
  AdminDashboardData,
  AdminUserRecord,
  CompanySummary,
  AdCampaignItem,
  AdSpendAuditSummary,
  InvoiceItem,
  CashFlowGuardStats,
  PaymentGatewayType,
  FeedbackTicket,
  FeedbackStatus,
  FeedbackType,
  ChangelogItem,
  VisitorSessionRecord,
  VisitorTrafficStats,
  VisitorType
} from '../types';
import { getSupabaseClient } from './crm';

// Storage keys for local resilience
const STORAGE_PREFIX = 'prime_app_';

function getLocalStore<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalStore<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {}
}

// Multi-Tenant Company Workspace Creation & Queries
export async function createNewCompanyWorkspace(
  ownerId: string,
  ownerEmail: string,
  companyName: string,
  industry: string = 'Enterprise SaaS',
  targetArr: number = 10000000
): Promise<Company> {
  const companyId = 'comp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  const newCompany: Company = {
    id: companyId,
    name: companyName,
    ownerId,
    industry,
    targetArr,
    plan: 'Pro',
    mrr: 999,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  // Save to local companies list
  const existingCompanies = getLocalStore<Company[]>('all_companies', []);
  const updated = [newCompany, ...existingCompanies.filter(c => c.id !== companyId)];
  setLocalStore('all_companies', updated);
  setLocalStore('company_' + companyId, newCompany);

  // Sync to Supabase 'companies' table
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('companies').upsert({
        id: companyId,
        name: companyName,
        owner_id: ownerId,
        industry,
        target_arr: targetArr,
        plan: 'Pro',
        mrr: 999,
        status: 'active',
        created_at: now,
        updated_at: now
      });

      // Also upsert owner in 'users' table
      await supabase.from('users').upsert({
        id: ownerId,
        email: ownerEmail,
        company_id: companyId,
        role: 'CEO',
        created_at: now
      });
    } catch (e) {
      console.warn('Supabase create company notice:', e);
    }
  }

  // Seed initial company data
  await seedInitialUserDataIfEmpty(companyId, ownerId, companyName);

  return newCompany;
}

export async function fetchCompanyById(companyId: string): Promise<Company | null> {
  const cached = getLocalStore<Company | null>('company_' + companyId, null);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();

      if (!error && data) {
        const comp: Company = {
          id: data.id,
          name: data.name,
          ownerId: data.owner_id,
          industry: data.industry || 'Enterprise SaaS',
          targetArr: Number(data.target_arr || 10000000),
          plan: data.plan || 'Pro',
          mrr: Number(data.mrr || 999),
          status: data.status || 'active',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString()
        };
        setLocalStore('company_' + companyId, comp);
        return comp;
      }
    } catch (e) {}
  }
  return null;
}

// Multi-Tenant Global Admin Console Service (Total Users, MRR, Companies)
export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = getSupabaseClient();
  let companiesList: CompanySummary[] = [];

  if (supabase) {
    try {
      // 1. Fetch companies
      const { data: supaCompanies } = await supabase.from('companies').select('*');
      const { data: supaUsers } = await supabase.from('users').select('*');
      const { data: supaSubs } = await supabase.from('subscriptions').select('*');
      const { data: supaDeals } = await supabase.from('deals').select('*');

      if (supaCompanies && supaCompanies.length > 0) {
        companiesList = supaCompanies.map((c: any) => {
          const compUsers = (supaUsers || []).filter((u: any) => u.company_id === c.id);
          const compSub = (supaSubs || []).find((s: any) => s.company_id === c.id);
          const compDeals = (supaDeals || []).filter((d: any) => d.company_id === c.id);
          const pipelineVal = compDeals.reduce((sum: number, d: any) => sum + Number(d.deal_value || d.revenue || 0), 0);
          const plan = (compSub?.plan || c.plan || 'Pro') as any;
          const mrr = compSub?.status === 'active' 
            ? (compSub.plan_price || (plan === 'Starter' ? 499 : plan === 'Enterprise' ? 2999 : 999))
            : (c.status === 'active' ? (c.mrr || 999) : 0);

          return {
            id: c.id,
            name: c.name,
            ownerEmail: compUsers[0]?.email || 'owner@' + (c.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company') + '.com',
            ownerName: compUsers[0]?.full_name || 'Executive Lead',
            plan,
            mrr,
            userCount: Math.max(1, compUsers.length),
            dealsCount: compDeals.length,
            pipelineValue: pipelineVal,
            status: c.status || compSub?.status || 'active',
            createdAt: c.created_at || new Date().toISOString(),
            industry: c.industry || 'Enterprise SaaS'
          };
        });
      }
    } catch (e) {
      console.warn('Supabase admin metrics query notice:', e);
    }
  }

  // Fallback / local store aggregation if Supabase is offline or empty
  if (companiesList.length === 0) {
    const localComps = getLocalStore<Company[]>('all_companies', []);

    if (localComps.length > 0) {
      companiesList = localComps.map(c => {
        const compDeals = getLocalStore<any[]>('prime_crm_records_company_' + c.id, []);
        const pipelineVal = compDeals.reduce((sum: number, d: any) => sum + Number(d.dealValue || d.deal_value || 0), 0);
        return {
          id: c.id,
          name: c.name,
          ownerEmail: 'adnanakhan245@gmail.com',
          ownerName: 'Adnan Khan',
          plan: (c.plan as any) || 'Enterprise',
          mrr: c.mrr || 0,
          userCount: 1,
          dealsCount: compDeals.length,
          pipelineValue: pipelineVal,
          status: c.status || 'active',
          createdAt: c.createdAt || new Date().toISOString(),
          industry: c.industry || 'Enterprise SaaS'
        };
      });
    } else {
      const activeCompId = localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
      const compDeals = getLocalStore<any[]>('prime_crm_records_company_' + activeCompId, []);
      const pipelineVal = compDeals.reduce((sum: number, d: any) => sum + Number(d.dealValue || d.deal_value || 0), 0);
      companiesList = [
        {
          id: activeCompId,
          name: 'Apex Enterprises (HQ)',
          ownerEmail: 'adnanakhan245@gmail.com',
          ownerName: 'Adnan Khan',
          plan: 'Enterprise',
          mrr: 0,
          userCount: 1,
          dealsCount: compDeals.length,
          pipelineValue: pipelineVal,
          status: 'active',
          createdAt: new Date().toISOString(),
          industry: 'Enterprise SaaS'
        }
      ];
    }
  }

  // Compile comprehensive registered users directory
  const usersList: AdminUserRecord[] = [];
  const seenEmails = new Set<string>();

  // 1. Current active user from localStorage (e.g. adnanakhan245@gmail.com)
  try {
    const rawProf = localStorage.getItem('prime_user_profile');
    if (rawProf) {
      const prof = JSON.parse(rawProf);
      if (prof && prof.email) {
        const isSuper = prof.email === 'adnanakhan245@gmail.com' || prof.role?.includes('Admin') || prof.email.includes('admin');
        usersList.push({
          uid: prof.uid || 'usr_super_01',
          email: prof.email,
          displayName: prof.displayName || (isSuper ? 'Adnan Khan' : 'Workspace Founder'),
          role: isSuper ? 'Super Admin / Owner' : (prof.role || 'Chief Executive Officer'),
          companyId: prof.companyId || 'comp_apex_01',
          companyName: prof.companyName || 'Apex Enterprises',
          plan: (prof.plan || 'Enterprise') as any,
          createdAt: prof.createdAt || new Date().toISOString(),
          lastActive: 'Active Now',
          status: 'active',
          isSuperAdmin: isSuper
        });
        seenEmails.add(prof.email.toLowerCase());
      }
    }
  } catch (e) {}

  // Ensure adnanakhan245@gmail.com is listed as platform owner if not already
  const masterAdminEmail = 'adnanakhan245@gmail.com';
  if (!seenEmails.has(masterAdminEmail)) {
    usersList.unshift({
      uid: 'usr_adnan_master',
      email: masterAdminEmail,
      displayName: 'Adnan Khan',
      role: 'Master Admin / Platform Owner',
      companyId: 'comp_apex_01',
      companyName: 'Apex Enterprises (HQ)',
      plan: 'Enterprise',
      createdAt: new Date().toISOString(),
      lastActive: 'Active Now',
      status: 'active',
      isSuperAdmin: true
    });
    seenEmails.add(masterAdminEmail);
  }

  // 2. Add real users from Supabase if available
  if (supabase) {
    try {
      const { data: supaUsers } = await supabase.from('users').select('*');
      if (supaUsers && supaUsers.length > 0) {
        for (const u of supaUsers) {
          if (u.email && !seenEmails.has(u.email.toLowerCase())) {
            const isSuper = u.email === masterAdminEmail || u.role?.includes('Admin');
            usersList.push({
              uid: u.id || `usr_${Math.random().toString(36).slice(2, 8)}`,
              email: u.email,
              displayName: u.full_name || u.displayName || u.email.split('@')[0],
              role: u.role || (isSuper ? 'Super Admin' : 'Executive Member'),
              companyId: u.company_id || 'comp_apex_01',
              companyName: u.company_name || 'Apex Enterprises',
              plan: (u.plan || 'Pro') as any,
              createdAt: u.created_at || new Date().toISOString(),
              lastActive: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Recent',
              status: (u.status || 'active') as any,
              isSuperAdmin: isSuper
            });
            seenEmails.add(u.email.toLowerCase());
          }
        }
      }
    } catch (e) {}
  }

  // 3. Add real registered accounts from Firestore 'profiles' across all devices
  try {
    const profilesSnap = await getDocs(query(collection(db, 'profiles'), limit(150)));
    profilesSnap.forEach((docSnap) => {
      const p = docSnap.data() as any;
      const isMockDemoUser = p?.email?.toLowerCase().includes('ceo@apexenterprise.com') || 
                             p?.displayName?.toLowerCase() === 'alexander vance';
      if (p && p.email && !isMockDemoUser && !seenEmails.has(p.email.toLowerCase())) {
        const isSuper = p.email.toLowerCase() === masterAdminEmail || p.role?.includes('Admin');
        usersList.push({
          uid: p.uid || docSnap.id,
          email: p.email,
          displayName: p.displayName || p.fullName || p.email.split('@')[0],
          role: p.role || (isSuper ? 'Super Admin' : 'Executive Member'),
          companyId: p.companyId || 'comp_' + docSnap.id.slice(0, 6),
          companyName: p.companyName || `${p.displayName || p.email.split('@')[0]}'s Workspace`,
          plan: (p.plan || 'Pro') as any,
          createdAt: p.createdAt || new Date().toISOString(),
          lastActive: 'Active User',
          status: 'active',
          isSuperAdmin: isSuper
        });
        seenEmails.add(p.email.toLowerCase());
      }
    });
  } catch (err) {
    console.warn('Firestore profiles fetch notice:', err);
  }

  // 4. Add registered leads from Firestore 'admin_leads'
  try {
    const leadsSnap = await getDocs(query(collection(db, 'admin_leads'), limit(150)));
    leadsSnap.forEach((docSnap) => {
      const lead = docSnap.data() as any;
      const isMockDemoLead = lead?.email?.toLowerCase().includes('ceo@apexenterprise.com') ||
                             lead?.fullName?.toLowerCase() === 'alexander vance';
      if (lead && lead.email && !isMockDemoLead && !seenEmails.has(lead.email.toLowerCase())) {
        usersList.push({
          uid: lead.id || docSnap.id,
          email: lead.email,
          displayName: lead.fullName || lead.email.split('@')[0],
          role: 'Registered Executive / Lead',
          companyId: 'comp_' + docSnap.id.slice(0, 6),
          companyName: lead.companyName || `${lead.fullName || lead.email.split('@')[0]}'s Workspace`,
          plan: (lead.plan || '14-Day Pro Trial') as any,
          createdAt: lead.signedUpAt || new Date().toISOString(),
          lastActive: 'Recent Trial',
          status: 'active',
          isSuperAdmin: false
        });
        seenEmails.add(lead.email.toLowerCase());
      }
    });
  } catch (err) {
    console.warn('Firestore admin_leads fetch notice:', err);
  }

  const totalMRR = companiesList.reduce((acc, c) => acc + (c.mrr || 0), 0);
  const totalUsers = usersList.length;
  const totalPipelineARR = companiesList.reduce((acc, c) => acc + (c.pipelineValue || 0), 0);
  const totalDeals = companiesList.reduce((acc, c) => acc + (c.dealsCount || 0), 0);
  const activeTrialsCount = companiesList.filter(c => c.status === 'trialing').length;
  const paidCompaniesCount = companiesList.filter(c => c.status === 'active').length;

  let visitorStats: VisitorTrafficStats | undefined;
  try {
    visitorStats = await fetchVisitorAnalytics();
  } catch (err) {
    console.warn('Failed to load visitor analytics for admin:', err);
  }

  return {
    totalUsers,
    totalMRR,
    totalCompanies: companiesList.length,
    totalPipelineARR,
    totalPipelineValue: totalPipelineARR,
    totalDeals,
    activeTrialsCount,
    paidCompaniesCount,
    companies: companiesList,
    users: usersList,
    visitorStats
  };
}

export async function fetchAllCompanies(): Promise<CompanySummary[]> {
  const adminData = await fetchAdminDashboardData();
  return adminData.companies;
}

// Seed initial realistic data for new users and companies - NO-OP by default for clean start
export async function seedInitialUserDataIfEmpty(
  param1?: string,
  param2?: string,
  param3?: string
) {
  // Fresh workspaces start empty with 0 deals, 0 users, 0 emails, 0 pipeline
  return;
  let resolvedCompanyId = 'comp_apex_01';
  let resolvedUserId = 'user_ceo_01';
  let companyName = 'Apex Enterprises';

  if (param3) {
    resolvedCompanyId = param1;
    resolvedUserId = param2 || 'user_ceo_01';
    companyName = param3;
  } else if (param2) {
    resolvedUserId = param1;
    companyName = param2;
    resolvedCompanyId = 'comp_' + resolvedUserId;
  } else if (param1) {
    resolvedUserId = param1;
    resolvedCompanyId = 'comp_' + resolvedUserId;
  }

  const initialEmails: Omit<EmailItem, 'id'>[] = [
    {
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      sender: 'Sarah Jenkins',
      senderEmail: 'sjenkins@apexenterprise.com',
      subject: `URGENT: Enterprise Contract Renewal & SLA Amendment ($420k ARR) - ${companyName}`,
      snippet: 'Regarding our Q4 master service agreement renewal, the procurement board needs clarity on the latency guarantees...',
      fullBody: `Hi Leadership,\n\nOur procurement team reviewed the Master Service Agreement for the $420k ARR renewal scheduled for next month. Overall the executive board is thrilled with ${companyName}, but our General Counsel requires two specific modifications before signing off on Friday:\n\n1. A 99.95% uptime SLA commitment with standard service credit clauses.\n2. Verification that our customer data remains strictly partitioned with SOC2 compliant auditing.\n\nPlease send the revised addendum by 3 PM Thursday so we can finalize signatures without billing interruption.\n\nWarm regards,\nSarah Jenkins\nVP of Enterprise Procurement`,
      urgency: 'HIGH',
      category: 'CLIENT',
      receivedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      status: 'PENDING_REVIEW',
      aiDraftReply: `Dear Sarah,\n\nThank you for the update. We are pleased to confirm both requirements for the Q4 Master Service Agreement renewal with ${companyName}:\n\n1. We have incorporated the 99.95% uptime SLA with standard service credit schedules directly into Section 4.2 of the addendum.\n2. Our SOC2 Type II compliance report and tenant-isolated data architecture documentation are attached for your General Counsel's immediate review.\n\nThe revised signature-ready agreement has been expedited through DocuSign for your execution ahead of Thursday 3 PM.\n\nBest regards,\nExecutive Operations Team`,
      aiKeyTakeaway: 'Client is ready to renew $420k ARR contract upon receipt of updated 99.95% SLA and SOC2 tenant documentation before Thursday 3 PM.',
      aiSuggestedAction: 'Approve & send drafted reply, transmit executed SLA amendment, and alert account executive for signature confirmation.'
    },
    {
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      sender: 'Marcus Sterling',
      senderEmail: 'm.sterling@vanguard-infrastructure.io',
      subject: 'Vendor Notice: Cloud Compute Pricing Index & Tier Optimization',
      snippet: 'Notice of revised cluster pricing tiers effective next quarter. We recommend transitioning to reserved instances...',
      fullBody: `Hello Operations,\n\nAs part of our annual infrastructure optimization review, our team analyzed your monthly GPU and cloud compute workload for ${companyName}. By migrating 60% of your on-demand nodes to 1-year reserved compute instances, you can reduce your baseline infrastructure spend by 22.4% (approx. $14,200/month).\n\nPlease let us know if you would like our solutions architect to provision the reserved capacity schedule.\n\nBest,\nMarcus Sterling\nPrincipal Solutions Lead`,
      urgency: 'MEDIUM',
      category: 'VENDOR',
      receivedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      status: 'PENDING_REVIEW',
      aiDraftReply: `Hi Marcus,\n\nThank you for the proactive optimization report. We approve migrating the designated 60% workload to the 1-year reserved tier to capture the 22.4% cost reduction ($14.2k/mo).\n\nPlease coordinate with our DevOps lead to schedule the provisioning window during off-peak hours this Saturday.\n\nRegards,\nChief Operations Officer`,
      aiKeyTakeaway: 'Infrastructure vendor offers 22.4% cost savings ($14.2k/mo) by converting on-demand clusters to 1-year reserved instances.',
      aiSuggestedAction: 'Approve reserved compute transition to instantly optimize monthly burn rate.'
    },
    {
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      sender: 'Elena Rostova',
      senderEmail: 'elena@summitventures.capital',
      subject: 'Board Meeting Prep: Q3 Unit Economics & Growth Velocity Deck',
      snippet: 'Ahead of our upcoming board session on Tuesday, please send over the latest gross margin breakdown...',
      fullBody: `Hi Team,\n\nAhead of our upcoming board session next Tuesday at 10 AM, the investment committee would love to review the latest Q3 gross margin numbers, payback period metrics, and headcount expansion roadmap for ${companyName}.\n\nPlease share the executive summary deck by Monday morning.\n\nLooking forward to catching up,\nElena Rostova\nGeneral Partner, Summit Ventures`,
      urgency: 'HIGH',
      category: 'INVESTOR',
      receivedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      status: 'APPROVED',
      aiDraftReply: `Hi Elena,\n\nOur Q3 unit economics deck and strategic roadmap for ${companyName} are finalized. Key highlights include 84.2% gross margins, an accelerated 6.4-month CAC payback period, and our planned key hires.\n\nThe complete executive packet is linked and scheduled for discussion during Tuesday's 10 AM session.\n\nBest regards,\nExecutive Leadership`,
      aiKeyTakeaway: 'Investor requesting Q3 financial and unit economic metrics deck for Tuesday board meeting.',
      aiSuggestedAction: 'Compiled and approved. Deck delivered to board portal.',
      approvedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
    }
  ];

  const initialDocs: DocumentItem[] = [
    {
      id: `doc_q3_${resolvedCompanyId}_001`,
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      title: `${companyName} - Operations & Revenue Expansion Strategy.pdf`,
      fileType: 'application/pdf',
      fileSize: 1024 * 480,
      content: `EXECUTIVE SUMMARY - OPERATIONS & REVENUE ROADMAP FOR ${companyName}\nTarget: $10M ARR Milestone\nCurrent Run Rate: $6.8M ARR\nGross Margin: 83.5%\nCore Focus Areas:\n1. Enterprise Pipeline Expansion (ACV > $120k)\n2. Autonomous Ops Automation (Reduce customer onboarding time by 50%)\n3. International Tier-1 expansion into EMEA.\nKey Risks: Vendor latency dependencies, hiring bottleneck in Solutions Architecture.\nAction Items: Deploy automated triage, lock reserved compute contracts, onboard VP of Solutions.`,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      summary: `Strategic operational blueprint for ${companyName} scaling from $6.8M to $10M ARR while maintaining 83.5% gross margin via autonomous workflow efficiency and enterprise sales expansion.`,
      keyPoints: [
        'Target ARR expansion from $6.8M to $10M target with 83.5% gross margins.',
        'Autonomous operations workflow cuts enterprise client onboarding by 50%.',
        'EMEA market expansion planned for Q4 with dedicated local compliance.'
      ],
      risks: [
        'Solutions Architecture hiring lead time may create onboarding bottlenecks.',
        'Vendor latency on third-party integrations requiring strict SLA monitoring.'
      ],
      nextActions: [
        'Execute automated workflow rollout to accelerate onboarding cycle.',
        'Initiate executive search for VP of Solutions Architecture.',
        'Lock annual cloud vendor reserved contracts to secure 22% cost reduction.'
      ],
      category: 'STRATEGY'
    }
  ];

  const initialActs: ActivityItem[] = [
    {
      id: `act_${resolvedCompanyId}_001`,
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      type: 'EMAIL_APPROVED',
      title: 'Approved Board Pack Response',
      description: `Delivered Q3 unit economics packet to Summit Ventures GP for ${companyName}.`,
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString()
    },
    {
      id: `act_${resolvedCompanyId}_002`,
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      type: 'DOC_ANALYZED',
      title: 'Analyzed Q3 Operations Strategy',
      description: 'Extracted 3 core growth pillars and identified 2 operational bottlenecks.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    },
    {
      id: `act_${resolvedCompanyId}_003`,
      companyId: resolvedCompanyId,
      userId: resolvedUserId,
      type: 'EMAIL_TRIAGED',
      title: 'Triage: $420k Enterprise Contract Renewal',
      description: 'PRIME AI drafted decisive SLA compliance reply for Sarah Jenkins.',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString()
    }
  ];

  // Seed local storage cache partitioned by companyId
  const localEmails = getLocalStore<EmailItem[]>('emails_' + resolvedCompanyId, []);
  if (localEmails.length === 0) {
    const seeded = initialEmails.map((e, idx) => ({ ...e, id: `email_${resolvedCompanyId}_${idx}` }));
    setLocalStore('emails_' + resolvedCompanyId, seeded);
  }

  const localDocs = getLocalStore<DocumentItem[]>('docs_' + resolvedCompanyId, []);
  if (localDocs.length === 0) {
    setLocalStore('docs_' + resolvedCompanyId, initialDocs);
  }

  const localActs = getLocalStore<ActivityItem[]>('acts_' + resolvedCompanyId, []);
  if (localActs.length === 0) {
    setLocalStore('acts_' + resolvedCompanyId, initialActs);
  }

  // Attempt Supabase 'inbox' table sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      for (const e of initialEmails) {
        await supabase.from('inbox').upsert({
          id: `email_${resolvedCompanyId}_${e.sender.toLowerCase().replace(/[^a-z]/g, '')}`,
          company_id: resolvedCompanyId,
          user_id: resolvedUserId,
          sender: e.sender,
          sender_email: e.senderEmail,
          subject: e.subject,
          snippet: e.snippet,
          full_body: e.fullBody,
          urgency: e.urgency,
          category: e.category,
          status: e.status,
          received_at: e.receivedAt,
          ai_draft_reply: e.aiDraftReply,
          ai_key_takeaway: e.aiKeyTakeaway,
          ai_suggested_action: e.aiSuggestedAction,
        });
      }
    } catch (e) {}
  }
}

// EMAILS SERVICE (Strictly isolated by company_id)
export async function fetchUserEmails(companyId: string, userId?: string): Promise<EmailItem[]> {
  const resolvedCompanyId = companyId || 'default_comp';
  const resolvedUserId = userId || 'user_anon';

  // 1. Try querying Supabase 'inbox' table with .eq('company_id', companyId)
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('inbox')
        .select('*')
        .eq('company_id', resolvedCompanyId)
        .order('received_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: EmailItem[] = data.map((d: any) => ({
          id: d.id,
          companyId: d.company_id || resolvedCompanyId,
          userId: d.user_id || resolvedUserId,
          sender: d.sender,
          senderEmail: d.sender_email || d.senderEmail,
          subject: d.subject,
          snippet: d.snippet,
          fullBody: d.full_body || d.fullBody,
          urgency: d.urgency || 'MEDIUM',
          category: d.category || 'CLIENT',
          receivedAt: d.received_at || d.receivedAt || new Date().toISOString(),
          status: d.status || 'PENDING_REVIEW',
          aiDraftReply: d.ai_draft_reply || d.aiDraftReply,
          aiKeyTakeaway: d.ai_key_takeaway || d.aiKeyTakeaway,
          aiSuggestedAction: d.ai_suggested_action || d.aiSuggestedAction,
          approvedAt: d.approved_at || d.approvedAt
        }));
        setLocalStore('emails_' + resolvedCompanyId, mapped);
        return mapped;
      }
    } catch (e) {}
  }

  // 2. Local storage partitioned by companyId
  const local = getLocalStore<EmailItem[]>('emails_' + resolvedCompanyId, []);
  const genuine = local.filter(e => 
    e.sender !== 'Sarah Jenkins' && 
    e.sender !== 'Marcus Sterling' && 
    e.sender !== 'Elena Rostova' && 
    e.sender !== 'David Vance'
  );
  if (genuine.length !== local.length) {
    setLocalStore('emails_' + resolvedCompanyId, genuine);
  }
  return genuine;
}

export async function saveEmail(email: Omit<EmailItem, 'id'>): Promise<EmailItem> {
  const compId = email.companyId || 'default_comp';
  const newId = 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const fullEmail: EmailItem = { ...email, id: newId, companyId: compId };

  // Save to local cache partitioned by companyId
  const list = getLocalStore<EmailItem[]>('emails_' + compId, []);
  list.unshift(fullEmail);
  setLocalStore('emails_' + compId, list);

  // Sync to Supabase 'inbox' table
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('inbox').upsert({
        id: newId,
        company_id: compId,
        user_id: email.userId,
        sender: email.sender,
        sender_email: email.senderEmail,
        subject: email.subject,
        snippet: email.snippet,
        full_body: email.fullBody,
        urgency: email.urgency,
        category: email.category,
        status: email.status,
        received_at: email.receivedAt,
        ai_draft_reply: email.aiDraftReply,
        ai_key_takeaway: email.aiKeyTakeaway,
        ai_suggested_action: email.aiSuggestedAction,
      });
    } catch (e) {}
  }

  return fullEmail;
}

export async function updateEmailStatus(
  companyId: string,
  userId: string, 
  emailId: string, 
  status: EmailItem['status'], 
  aiDraftReply?: string
) {
  const compId = companyId || 'default_comp';
  const list = getLocalStore<EmailItem[]>('emails_' + compId, []);
  const updated = list.map(e => {
    if (e.id === emailId) {
      return {
        ...e,
        status,
        ...(aiDraftReply !== undefined ? { aiDraftReply } : {}),
        ...((status === 'APPROVED' || status === 'SENT') ? { approvedAt: new Date().toISOString() } : {})
      };
    }
    return e;
  });
  setLocalStore('emails_' + compId, updated);

  // Supabase 'inbox' sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const updateData: any = { status };
      if (aiDraftReply !== undefined) updateData.ai_draft_reply = aiDraftReply;
      if (status === 'APPROVED' || status === 'SENT') updateData.approved_at = new Date().toISOString();
      
      await supabase
        .from('inbox')
        .update(updateData)
        .eq('id', emailId)
        .eq('company_id', compId);
    } catch (e) {}
  }

  // Log activity
  if (status === 'APPROVED' || status === 'SENT') {
    await logActivity({
      companyId: compId,
      userId,
      type: 'EMAIL_APPROVED',
      title: 'Executive Reply Approved & Sent',
      description: `Dispatched approved response for email #${emailId.slice(0, 8)}`,
      timestamp: new Date().toISOString()
    });
  }
}

// ----------------------------------------------------
// BRIEFINGS SERVICE (SUPABASE 'briefings' TABLE)
// ----------------------------------------------------
export async function fetchBriefings(companyId: string, userId?: string): Promise<BriefingRecord[]> {
  const compId = companyId || 'default_comp';
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('company_id', compId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: BriefingRecord[] = data.map((d: any) => ({
          id: d.id,
          companyId: d.company_id || compId,
          userId: d.user_id || userId || 'user_anon',
          date: d.briefing_date || d.date || new Date().toLocaleDateString(),
          headline: d.headline,
          arrForecast: Number(d.arr_forecast || 0),
          churnRiskArr: Number(d.churn_risk_arr || 0),
          pendingActionsCount: Number(d.pending_actions_count || 3),
          topPriorities: Array.isArray(d.top_priorities) ? d.top_priorities : [],
          operationalMetrics: d.operational_metrics || { emailsPending: 2, dealsInFlight: 4, hoursSaved: 18.5 },
          generatedAt: d.created_at || new Date().toISOString()
        }));
        setLocalStore('briefings_' + compId, mapped);
        return mapped;
      }
    } catch (e) {}
  }

  return getLocalStore<BriefingRecord[]>('briefings_' + compId, []);
}

export async function saveBriefing(briefing: BriefingRecord): Promise<BriefingRecord> {
  const compId = briefing.companyId || 'default_comp';
  const existing = getLocalStore<BriefingRecord[]>('briefings_' + compId, []);
  const updated = [briefing, ...existing.filter(b => b.id !== briefing.id)];
  setLocalStore('briefings_' + compId, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('briefings').upsert({
        id: briefing.id,
        company_id: compId,
        user_id: briefing.userId,
        briefing_date: briefing.date,
        headline: briefing.headline,
        arr_forecast: briefing.arrForecast,
        churn_risk_arr: briefing.churnRiskArr,
        top_priorities: briefing.topPriorities,
        operational_metrics: briefing.operationalMetrics,
        created_at: briefing.generatedAt || new Date().toISOString()
      });
    } catch (e) {}
  }

  return briefing;
}

export async function saveSentEmailToSupabase(
  userId: string,
  email: EmailItem,
  replyBody: string
): Promise<{ success: boolean; error?: string; source: 'supabase' | 'local_storage' }> {
  const supabase = getSupabaseClient();
  const emailPayload = {
    id: email.id,
    user_id: userId,
    sender: email.sender,
    sender_email: email.senderEmail,
    subject: email.subject,
    body: email.fullBody,
    reply_body: replyBody,
    status: 'sent',
    sent_at: new Date().toISOString(),
    created_at: email.receivedAt || new Date().toISOString()
  };

  // Always mirror in localStorage for resilient querying
  try {
    const sentKey = 'prime_supabase_sent_emails_' + userId;
    const existing = JSON.parse(localStorage.getItem(sentKey) || '[]');
    const filtered = existing.filter((e: any) => e.id !== email.id);
    filtered.unshift(emailPayload);
    localStorage.setItem(sentKey, JSON.stringify(filtered));
  } catch (e) {}

  if (supabase) {
    try {
      const { error } = await supabase
        .from('emails')
        .upsert([emailPayload]);
      if (error) {
        console.warn('Supabase emails table note:', error.message);
        return { success: true, source: 'local_storage', error: error.message };
      }
      return { success: true, source: 'supabase' };
    } catch (err: any) {
      console.warn('Supabase sync notice:', err?.message || err);
      return { success: true, source: 'local_storage', error: err?.message };
    }
  }

  return { success: true, source: 'local_storage' };
}

export async function deleteEmail(emailId: string) {
  // Try to remove from all local stores
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX + 'emails_')) {
      const list = getLocalStore<EmailItem[]>(key.replace(STORAGE_PREFIX, ''), []);
      const filtered = list.filter(e => e.id !== emailId);
      setLocalStore(key.replace(STORAGE_PREFIX, ''), filtered);
    }
  }

  try {
    await deleteDoc(doc(db, 'emails', emailId));
  } catch (e) {}
}

// DOCUMENTS SERVICE
export async function fetchUserDocuments(userId: string): Promise<DocumentItem[]> {
  try {
    const docsRef = collection(db, 'documents');
    const q = query(docsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docs: DocumentItem[] = [];
      snapshot.forEach(d => docs.push({ id: d.id, ...d.data() } as DocumentItem));
      const sorted = docs
        .filter(d => !d.id.startsWith('doc_q3_') && !d.id.startsWith('doc_apex_') && !d.title.includes('Q3 Enterprise Board Pack') && !d.title.includes('Apex Operations Scaling'))
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setLocalStore('docs_' + userId, sorted);
      return sorted;
    }
  } catch (err) {}

  const local = getLocalStore<DocumentItem[]>('docs_' + userId, []);
  const genuine = local.filter(d => 
    !d.id.startsWith('doc_q3_') &&
    !d.id.startsWith('doc_apex_') &&
    !d.title.includes('Q3 Enterprise Board Pack') &&
    !d.title.includes('Apex Operations Scaling')
  );
  if (genuine.length !== local.length) {
    setLocalStore('docs_' + userId, genuine);
  }
  return genuine;
}

export async function saveDocument(documentData: Omit<DocumentItem, 'id'>): Promise<DocumentItem> {
  const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const fullDoc: DocumentItem = { ...documentData, id: docId };

  // Local cache
  const list = getLocalStore<DocumentItem[]>('docs_' + documentData.userId, []);
  list.unshift(fullDoc);
  setLocalStore('docs_' + documentData.userId, list);

  // Firestore sync
  try {
    const docRef = doc(collection(db, 'documents'), docId);
    await setDoc(docRef, fullDoc);
  } catch (err) {}

  // Log activity
  await logActivity({
    userId: documentData.userId,
    type: 'DOC_ANALYZED',
    title: `Document Analyzed: ${documentData.title}`,
    description: `Extracted ${documentData.keyPoints.length} strategic points and ${documentData.risks.length} risk flags.`,
    timestamp: new Date().toISOString()
  });

  return fullDoc;
}

export async function deleteDocument(docId: string) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX + 'docs_')) {
      const list = getLocalStore<DocumentItem[]>(key.replace(STORAGE_PREFIX, ''), []);
      const filtered = list.filter(d => d.id !== docId);
      setLocalStore(key.replace(STORAGE_PREFIX, ''), filtered);
    }
  }

  try {
    await deleteDoc(doc(db, 'documents', docId));
  } catch (e) {}
}

// CHAT HISTORY SERVICE
export async function fetchChatHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const chatRef = collection(db, 'chat_history');
    const q = query(chatRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const messages: ChatMessage[] = [];
      snapshot.forEach(d => messages.push({ id: d.id, ...d.data() } as ChatMessage));
      const sorted = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setLocalStore('chat_' + userId, sorted);
      return sorted;
    }
  } catch (err) {}

  return getLocalStore<ChatMessage[]>('chat_' + userId, []);
}

export async function saveChatMessage(msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
  const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const fullMsg: ChatMessage = { ...msg, id: msgId };

  // Local cache
  const list = getLocalStore<ChatMessage[]>('chat_' + msg.userId, []);
  list.push(fullMsg);
  setLocalStore('chat_' + msg.userId, list);

  // Firestore sync
  try {
    const msgRef = doc(collection(db, 'chat_history'), msgId);
    await setDoc(msgRef, fullMsg);
  } catch (err) {}

  return fullMsg;
}

export async function clearChatHistory(userId: string) {
  setLocalStore('chat_' + userId, []);
  try {
    const chatRef = collection(db, 'chat_history');
    const q = query(chatRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (err) {}
}

// ACTIVITY LOGS SERVICE
export async function fetchUserActivities(userId: string, maxItems = 10): Promise<ActivityItem[]> {
  try {
    const actRef = collection(db, 'activities');
    const q = query(actRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const acts: ActivityItem[] = [];
      snapshot.forEach(d => acts.push({ id: d.id, ...d.data() } as ActivityItem));
      const sorted = acts
        .filter(a => a.id !== '1' && a.id !== '2' && a.id !== '3' && !a.id.includes('_001') && !a.id.includes('_002') && !a.id.includes('_003'))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxItems);
      setLocalStore('acts_' + userId, sorted);
      return sorted;
    }
  } catch (err) {}

  const local = getLocalStore<ActivityItem[]>('acts_' + userId, []);
  const genuine = local.filter(a => 
    a.id !== '1' && a.id !== '2' && a.id !== '3' &&
    !a.id.includes('_001') && !a.id.includes('_002') && !a.id.includes('_003') &&
    !a.title.includes('Approved Board Pack Response') &&
    !a.title.includes('Analyzed Q3 Operations Strategy') &&
    !a.title.includes('Triage: $420k Enterprise Contract')
  );
  if (genuine.length !== local.length) {
    setLocalStore('acts_' + userId, genuine);
  }
  return genuine.slice(0, maxItems);
}

export async function logActivity(activity: Omit<ActivityItem, 'id'>): Promise<ActivityItem> {
  const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const fullAct: ActivityItem = { ...activity, id: actId };

  // Local cache
  const list = getLocalStore<ActivityItem[]>('acts_' + activity.userId, []);
  list.unshift(fullAct);
  setLocalStore('acts_' + activity.userId, list.slice(0, 50));

  // Firestore sync
  try {
    const actRef = doc(collection(db, 'activities'), actId);
    await setDoc(actRef, fullAct);
  } catch (err) {}

  return fullAct;
}

export async function addActivityLog(
  userId: string,
  type: ActivityItem['type'],
  title: string,
  description: string
): Promise<ActivityItem> {
  return logActivity({
    userId,
    type,
    title,
    description,
    timestamp: new Date().toISOString()
  });
}

export async function createInboxEmailFromDraft(
  companyIdOrUserId: string,
  userIdOrDraft: any,
  draftMaybe?: {
    sender: string;
    senderEmail: string;
    subject: string;
    snippet: string;
    fullBody: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'CLIENT' | 'VENDOR' | 'INVESTOR' | 'TEAM' | 'LEGAL';
    aiDraftReply?: string;
    aiKeyTakeaway?: string;
    aiSuggestedAction?: string;
  }
): Promise<EmailItem> {
  let companyId = 'default_comp';
  let userId = 'user_anon';
  let draft: any = {};

  if (draftMaybe) {
    companyId = companyIdOrUserId;
    userId = userIdOrDraft;
    draft = draftMaybe;
  } else {
    userId = companyIdOrUserId;
    draft = userIdOrDraft;
    companyId = draft.companyId || 'default_comp';
  }

  return saveEmail({
    companyId,
    userId,
    ...draft,
    receivedAt: new Date().toISOString(),
    status: 'PENDING_REVIEW'
  });
}

// Compute live KPIs
export async function getKPISummary(companyIdOrUserId: string, userIdMaybe?: string): Promise<KPISummary> {
  const companyId = userIdMaybe ? companyIdOrUserId : 'default_comp';
  const userId = userIdMaybe || companyIdOrUserId;

  try {
    const emails = await fetchUserEmails(companyId, userId);
    const documents = await fetchUserDocuments(userId);

    const emailsHandled = emails.filter(e => e.status === 'APPROVED' || e.status === 'SENT' || e.status === 'IGNORED').length;
    const pendingEmailsCount = emails.filter(e => e.status === 'PENDING_REVIEW').length;
    const docsAnalyzed = documents.length;
    
    // Calculate realistic hours saved: ~0.45 hrs per email handled + 1.6 hrs per document analyzed
    const hoursSaved = Number(((emailsHandled * 0.45) + (docsAnalyzed * 1.6)).toFixed(1));

    return {
      emailsHandled,
      docsAnalyzed,
      hoursSaved,
      pendingEmailsCount,
      totalDocsCount: docsAnalyzed
    };
  } catch (err) {
    return {
      emailsHandled: 0,
      docsAnalyzed: 0,
      hoursSaved: 0,
      pendingEmailsCount: 0,
      totalDocsCount: 0
    };
  }
}

// ==========================================
// PRIME CLOSER AI SUPABASE PERSISTENCE ('calls')
// ==========================================

export async function saveCallToSupabase(
  userId: string,
  callData: {
    id?: string;
    filename: string;
    score: number;
    transcript: string;
    feedback_wrong: string[];
    feedback_right: string[];
    better_script: string;
    fileSize?: number;
    durationSeconds?: number;
  }
): Promise<CallRecord> {
  const callId = callData.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: CallRecord = {
    id: callId,
    userId,
    filename: callData.filename,
    fileSize: callData.fileSize,
    durationSeconds: callData.durationSeconds,
    score: callData.score,
    transcript: callData.transcript,
    feedback_wrong: callData.feedback_wrong,
    feedback_right: callData.feedback_right,
    better_script: callData.better_script,
    createdAt,
    syncedToSupabase: false,
  };

  // 1. Local Cache for instant reactivity
  const existingCalls = getLocalStore<CallRecord[]>(`calls_${userId}`, []);
  const updatedCalls = [record, ...existingCalls.filter(c => c.id !== callId)];
  setLocalStore(`calls_${userId}`, updatedCalls);

  // 2. Persist to Supabase 'calls' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('calls')
        .upsert(
          {
            id: callId,
            user_id: userId,
            filename: record.filename,
            score: record.score,
            transcript: record.transcript,
            feedback_wrong: record.feedback_wrong,
            feedback_right: record.feedback_right,
            better_script: record.better_script,
            created_at: createdAt,
          },
          { onConflict: 'id' }
        );

      if (!error) {
        record.syncedToSupabase = true;
        setLocalStore(`calls_${userId}`, [
          record,
          ...existingCalls.filter(c => c.id !== callId),
        ]);
      } else {
        console.warn('Supabase calls insert note:', error.message);
      }
    }
  } catch (err: any) {
    console.warn('Supabase calls sync notice:', err.message);
  }

  // 3. Fallback / mirror to Firestore
  try {
    const docRef = doc(db, 'calls', callId);
    await setDoc(docRef, {
      ...record,
      updatedAt: createdAt,
    }, { merge: true });
  } catch (e) {
    // Local store is already updated
  }

  // 4. Log Executive Activity
  logActivity({
    userId,
    type: 'BRAIN_CONSULT',
    title: `Sales Call Analyzed: ${record.filename}`,
    description: `PRIME Closer score: ${record.score}/100. 3 friction points, 3 strengths & executive script generated.`,
    timestamp: createdAt,
  }).catch(() => {});

  return record;
}

export async function fetchUserCalls(userId: string): Promise<CallRecord[]> {
  // 1. Try Supabase 'calls' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: CallRecord[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          filename: d.filename || 'Audio Call Recording',
          score: typeof d.score === 'number' ? d.score : 80,
          transcript: d.transcript || '',
          feedback_wrong: Array.isArray(d.feedback_wrong) ? d.feedback_wrong : [],
          feedback_right: Array.isArray(d.feedback_right) ? d.feedback_right : [],
          better_script: d.better_script || '',
          createdAt: d.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));
        setLocalStore(`calls_${userId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch calls fallback to local:', err);
  }

  // 2. Return local storage
  const localCalls = getLocalStore<CallRecord[]>(`calls_${userId}`, []);
  return localCalls;
}

// ==========================================
// PRIME HIRING AI SUPABASE PERSISTENCE ('candidates')
// ==========================================

export async function saveHiringAnalysisToSupabase(
  userId: string,
  analysisData: {
    id?: string;
    jobTitle: string;
    jobDescription: string;
    totalCVsAnalyzed: number;
    topCandidates: RankedCandidate[];
    interviewQuestions: string[];
    idealCandidateTraits?: string[];
  }
): Promise<HiringAnalysis> {
  const analysisId = analysisData.id || `hiring_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: HiringAnalysis = {
    id: analysisId,
    userId,
    jobTitle: analysisData.jobTitle,
    jobDescription: analysisData.jobDescription,
    totalCVsAnalyzed: analysisData.totalCVsAnalyzed,
    topCandidates: analysisData.topCandidates,
    interviewQuestions: analysisData.interviewQuestions,
    idealCandidateTraits: analysisData.idealCandidateTraits,
    createdAt,
    syncedToSupabase: false,
  };

  // 1. Local Cache
  const existingHiring = getLocalStore<HiringAnalysis[]>(`hiring_${userId}`, []);
  const updatedHiring = [record, ...existingHiring.filter(h => h.id !== analysisId)];
  setLocalStore(`hiring_${userId}`, updatedHiring);

  // 2. Persist to Supabase 'candidates' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('candidates')
        .upsert(
          {
            id: analysisId,
            user_id: userId,
            job_title: record.jobTitle,
            job_description: record.jobDescription,
            top_candidates: record.topCandidates,
            interview_questions: record.interviewQuestions,
            total_cvs_analyzed: record.totalCVsAnalyzed,
            created_at: createdAt,
          },
          { onConflict: 'id' }
        );

      if (!error) {
        record.syncedToSupabase = true;
        setLocalStore(`hiring_${userId}`, [
          record,
          ...existingHiring.filter(h => h.id !== analysisId),
        ]);
      } else {
        console.warn('Supabase candidates insert note:', error.message);
      }
    }
  } catch (err: any) {
    console.warn('Supabase candidates sync notice:', err.message);
  }

  // 3. Mirror to Firestore
  try {
    const docRef = doc(db, 'candidates', analysisId);
    await setDoc(docRef, {
      ...record,
      updatedAt: createdAt,
    }, { merge: true });
  } catch (e) {
    // Local store is already updated
  }

  // 4. Log Activity
  logActivity({
    userId,
    type: 'DOC_ANALYZED',
    title: `Candidate Shortlist & 10 Questions: ${record.jobTitle}`,
    description: `Ranked top 5 candidates out of ${record.totalCVsAnalyzed} CVs. Saved to Supabase candidates.`,
    timestamp: createdAt,
  }).catch(() => {});

  return record;
}

export async function fetchUserHiringAnalyses(userId: string): Promise<HiringAnalysis[]> {
  // 1. Try Supabase 'candidates' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: HiringAnalysis[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          jobTitle: d.job_title || 'Executive Search',
          jobDescription: d.job_description || '',
          totalCVsAnalyzed: typeof d.total_cvs_analyzed === 'number' ? d.total_cvs_analyzed : (Array.isArray(d.top_candidates) ? d.top_candidates.length : 10),
          topCandidates: Array.isArray(d.top_candidates) ? d.top_candidates : [],
          interviewQuestions: Array.isArray(d.interview_questions) ? d.interview_questions : [],
          createdAt: d.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));
        setLocalStore(`hiring_${userId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch candidates fallback to local:', err);
  }

  // 2. Return local storage
  const localHiring = getLocalStore<HiringAnalysis[]>(`hiring_${userId}`, []);
  const genuine = localHiring.filter(h => 
    !h.topCandidates?.some(c => c.name === 'Alexandra Chen' && c.match_score === 96)
  );
  if (genuine.length !== localHiring.length) {
    setLocalStore(`hiring_${userId}`, genuine);
  }
  return genuine;
}

// ==========================================
// PRIME MEETING AI SUPABASE PERSISTENCE ('meetings')
// ==========================================

export async function saveMeetingToSupabase(
  userId: string,
  meetingData: {
    id?: string;
    title: string;
    summary: string;
    action_items: MeetingActionItem[];
    draft_followup_email: MeetingDraftEmail;
    transcript?: string;
    filename?: string;
    fileSize?: number;
    durationSeconds?: number;
    emailSent?: boolean;
  }
): Promise<MeetingRecord> {
  const meetingId = meetingData.id || `meet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: MeetingRecord = {
    id: meetingId,
    userId,
    title: meetingData.title,
    summary: meetingData.summary,
    action_items: meetingData.action_items,
    draft_followup_email: meetingData.draft_followup_email,
    transcript: meetingData.transcript,
    filename: meetingData.filename,
    fileSize: meetingData.fileSize,
    durationSeconds: meetingData.durationSeconds,
    emailSent: meetingData.emailSent || false,
    createdAt,
    syncedToSupabase: false,
  };

  // 1. Local Cache for Instant Reactivity
  const existingMeetings = getLocalStore<MeetingRecord[]>(`meetings_${userId}`, []);
  const updatedMeetings = [record, ...existingMeetings.filter(m => m.id !== meetingId)];
  setLocalStore(`meetings_${userId}`, updatedMeetings);

  // 2. Persist to Supabase 'meetings' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .upsert(
          {
            id: meetingId,
            user_id: userId,
            title: record.title,
            summary: record.summary,
            action_items: record.action_items,
            draft_followup_email: record.draft_followup_email,
            created_at: createdAt,
          },
          { onConflict: 'id' }
        );

      if (!error) {
        record.syncedToSupabase = true;
        setLocalStore(`meetings_${userId}`, [
          record,
          ...existingMeetings.filter(m => m.id !== meetingId),
        ]);
      } else {
        console.warn('Supabase meetings insert note:', error.message);
      }
    }
  } catch (err: any) {
    console.warn('Supabase meetings sync notice:', err.message);
  }

  // 3. Fallback / mirror to Firestore
  try {
    const docRef = doc(db, 'meetings', meetingId);
    await setDoc(docRef, {
      ...record,
      updatedAt: createdAt,
    }, { merge: true });
  } catch (e) {
    // Local store is active
  }

  // 4. Log Activity
  logActivity({
    userId,
    type: 'DOC_ANALYZED',
    title: `Meeting Synthesized: ${record.title}`,
    description: `Executive summary, ${record.action_items.length} action items & draft follow-up email saved.`,
    timestamp: createdAt,
  }).catch(() => {});

  return record;
}

export async function fetchUserMeetings(userId: string): Promise<MeetingRecord[]> {
  // 1. Try Supabase 'meetings' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: MeetingRecord[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          title: d.title || 'Executive Meeting Sync',
          summary: d.summary || '',
          action_items: Array.isArray(d.action_items) ? d.action_items : [],
          draft_followup_email: d.draft_followup_email || { subject: '', body: '' },
          transcript: d.transcript || '',
          createdAt: d.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));
        setLocalStore(`meetings_${userId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch meetings fallback to local:', err);
  }

  // 2. Return local storage
  const localMeetings = getLocalStore<MeetingRecord[]>(`meetings_${userId}`, []);
  return localMeetings;
}

// ==========================================
// PRIME GROWTH LAB SUPABASE PERSISTENCE ('growth_audits')
// ==========================================

export async function saveGrowthAuditToSupabase(
  userId: string,
  auditData: {
    id?: string;
    url: string;
    company_name: string;
    growth_score: number;
    top_3_levers: GrowthLever[];
    action_plan_30_day: GrowthActionPlanItem[];
    summary?: string;
  }
): Promise<GrowthAuditRecord> {
  const auditId = auditData.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: GrowthAuditRecord = {
    id: auditId,
    userId,
    url: auditData.url,
    company_name: auditData.company_name,
    growth_score: auditData.growth_score,
    top_3_levers: auditData.top_3_levers,
    action_plan_30_day: auditData.action_plan_30_day,
    summary: auditData.summary,
    createdAt,
    syncedToSupabase: false,
  };

  // 1. Local Cache
  const existingAudits = getLocalStore<GrowthAuditRecord[]>(`growth_audits_${userId}`, []);
  const updatedAudits = [record, ...existingAudits.filter(a => a.id !== auditId)];
  setLocalStore(`growth_audits_${userId}`, updatedAudits);

  // 2. Persist to Supabase 'growth_audits' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('growth_audits')
        .upsert(
          {
            id: auditId,
            user_id: userId,
            url: record.url,
            company_name: record.company_name,
            growth_score: record.growth_score,
            top_3_levers: record.top_3_levers,
            action_plan_30_day: record.action_plan_30_day,
            created_at: createdAt,
          },
          { onConflict: 'id' }
        );

      if (!error) {
        record.syncedToSupabase = true;
        setLocalStore(`growth_audits_${userId}`, [
          record,
          ...existingAudits.filter(a => a.id !== auditId),
        ]);
      } else {
        console.warn('Supabase growth_audits insert note:', error.message);
      }
    }
  } catch (err: any) {
    console.warn('Supabase growth_audits sync notice:', err.message);
  }

  // 3. Mirror to Firestore
  try {
    const docRef = doc(db, 'growth_audits', auditId);
    await setDoc(docRef, {
      ...record,
      updatedAt: createdAt,
    }, { merge: true });
  } catch (e) {
    // Local store is active
  }

  // 4. Log Activity
  logActivity({
    userId,
    type: 'BRAIN_CONSULT',
    title: `Growth Audit Completed: ${record.company_name}`,
    description: `Growth Score: ${record.growth_score}/100. 3 Revenue Levers and 30-Day execution roadmap saved to Supabase.`,
    timestamp: createdAt,
  }).catch(() => {});

  return record;
}

export async function fetchUserGrowthAudits(userId: string): Promise<GrowthAuditRecord[]> {
  // 1. Try Supabase 'growth_audits' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('growth_audits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: GrowthAuditRecord[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          url: d.url || '',
          company_name: d.company_name || 'Enterprise Asset',
          growth_score: typeof d.growth_score === 'number' ? d.growth_score : 80,
          top_3_levers: Array.isArray(d.top_3_levers) ? d.top_3_levers : [],
          action_plan_30_day: Array.isArray(d.action_plan_30_day) ? d.action_plan_30_day : [],
          summary: d.summary || '',
          createdAt: d.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));
        setLocalStore(`growth_audits_${userId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch growth_audits fallback to local:', err);
  }

  // 2. Return local storage
  const localAudits = getLocalStore<GrowthAuditRecord[]>(`growth_audits_${userId}`, []);
  return localAudits;
}

// ==========================================
// 10. PRIME STRATEGY BOARD (Supabase table: 'strategies')
// ==========================================

export async function saveStrategyToSupabase(
  userId: string,
  data: {
    companyName: string;
    dateRange: string;
    strategy: StrategyPlan;
  }
): Promise<StrategyRecord> {
  const strategyId = `strat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const createdAt = new Date().toISOString();

  const record: StrategyRecord = {
    id: strategyId,
    userId,
    companyName: data.companyName || 'PRIME Corp',
    dateRange: data.dateRange || 'Last 90 Days',
    strategy: data.strategy,
    createdAt,
    syncedToSupabase: false,
  };

  // 1. Resilient local storage update
  const localStrategies = getLocalStore<StrategyRecord[]>(`strategies_${userId}`, []);
  const updatedLocal = [record, ...localStrategies.filter(s => s.id !== strategyId)];
  setLocalStore(`strategies_${userId}`, updatedLocal);

  // 2. Write to Supabase 'strategy_reports' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const healthScore = data.strategy.strategic_health_score || 88;
      const arrTarget = data.strategy.projected_arr_impact || '$2.4M ARR Target';
      
      // Write to 'strategy_reports' table
      const { data: supaRes, error: repErr } = await supabase
        .from('strategy_reports')
        .upsert([
          {
            id: strategyId,
            user_id: userId,
            health_score: healthScore,
            arr_target: arrTarget,
            risks: data.strategy.top_3_risks || [],
            opportunities: data.strategy.top_3_opportunities || [],
            company_name: record.companyName,
            date_range: record.dateRange,
            strategy_data: record.strategy,
            created_at: createdAt,
          }
        ])
        .select();

      if (!repErr && supaRes) {
        record.syncedToSupabase = true;
      }

      // Also write to 'strategies' table for compatibility
      try {
        await supabase
          .from('strategies')
          .upsert([
            {
              id: strategyId,
              user_id: userId,
              company_name: record.companyName,
              date_range: record.dateRange,
              executive_summary: record.strategy.executive_summary,
              top_3_risks: record.strategy.top_3_risks,
              top_3_opportunities: record.strategy.top_3_opportunities,
              q4_goals: record.strategy.q4_goals,
              team_assignments: record.strategy.team_assignments,
              strategy_data: record.strategy,
              created_at: createdAt,
            }
          ]);
      } catch (e) {}
    }
  } catch (err: any) {
    console.warn('Supabase strategy_reports sync notice:', err.message);
  }

  // 3. Mirror to Firestore
  try {
    const docRef = doc(db, 'strategies', strategyId);
    await setDoc(docRef, {
      ...record,
      updatedAt: createdAt,
    }, { merge: true });
  } catch (e) {
    // Local store active
  }

  // 4. Log Activity
  logActivity({
    userId,
    type: 'BRAIN_CONSULT',
    title: `Q4 Strategic Board Generated (${record.dateRange})`,
    description: `Executive 90-Day Strategy synthesized and saved to Supabase strategy_reports. Health Score: ${record.strategy.strategic_health_score || 88}/100.`,
    timestamp: createdAt,
  }).catch(() => {});

  return record;
}

export async function fetchUserStrategies(userId: string): Promise<StrategyRecord[]> {
  // 1. Try Supabase 'strategy_reports' table first
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      let { data, error } = await supabase
        .from('strategy_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const stratRes = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!stratRes.error && stratRes.data && stratRes.data.length > 0) {
          data = stratRes.data;
          error = null;
        }
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: StrategyRecord[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          companyName: d.company_name || 'PRIME Corp',
          dateRange: d.date_range || 'Last 90 Days',
          strategy: d.strategy_data || {
            executive_summary: d.executive_summary || '',
            strategic_health_score: d.health_score || 88,
            projected_arr_impact: d.arr_target || '$2.4M',
            top_3_risks: Array.isArray(d.risks || d.top_3_risks) ? (d.risks || d.top_3_risks) : [],
            top_3_opportunities: Array.isArray(d.opportunities || d.top_3_opportunities) ? (d.opportunities || d.top_3_opportunities) : [],
            q4_goals: Array.isArray(d.q4_goals) ? d.q4_goals : [],
            team_assignments: Array.isArray(d.team_assignments) ? d.team_assignments : [],
          },
          createdAt: d.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));
        setLocalStore(`strategies_${userId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch strategy_reports fallback to local:', err);
  }

  // 2. Return local storage
  const localStrategies = getLocalStore<StrategyRecord[]>(`strategies_${userId}`, []);
  return localStrategies;
}

// ----------------------------------------------------
// BOARD PACKS (SUPABASE 'board_packs' TABLE)
// ----------------------------------------------------

export async function saveBoardPackToSupabase(
  userId: string,
  companyName: string,
  quarter: string,
  boardPack: any
): Promise<any> {
  const newId = 'bp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  const record = {
    id: newId,
    userId,
    companyName,
    quarter,
    boardPack,
    createdAt: now,
    syncedToSupabase: false,
  };

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('board_packs')
        .insert({
          id: newId,
          user_id: userId,
          company_name: companyName,
          quarter,
          board_pack_data: boardPack,
          created_at: now,
        })
        .select()
        .single();

      if (!error && data) {
        record.syncedToSupabase = true;
      }
    }
  } catch (err) {
    console.warn('Supabase save board pack fallback to local cache:', err);
  }

  const existing = getLocalStore<any[]>(`board_packs_${userId}`, []);
  const updated = [record, ...existing.filter(b => b.id !== newId)];
  setLocalStore(`board_packs_${userId}`, updated);

  return record;
}

export async function fetchUserBoardPacks(userId: string): Promise<any[]> {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('board_packs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          companyName: d.company_name || 'PRIME Corp',
          quarter: d.quarter || 'Q4 2026',
          boardPack: d.board_pack_data || {},
          createdAt: d.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));
        setLocalStore(`board_packs_${userId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch board packs fallback to local:', err);
  }

  return getLocalStore<any[]>(`board_packs_${userId}`, []);
}

// =========================================================================
// 1. MARKETING & AD SPEND / CAC OPTIMIZER SERVICE (ZERO FAKE DATA)
// =========================================================================

export function computeAdCampaignMetrics(campaign: Partial<AdCampaignItem>): {
  calculatedCac: number;
  roas: number;
  status: AdCampaignItem['status'];
  wasteRiskMonthly: number;
  efficiencyGrade: AdCampaignItem['efficiencyGrade'];
  auditNotes: string;
  aiSuggestedAction: string;
} {
  const actualSpend = Number(campaign.actualSpend) || 0;
  const customersAcquired = Number(campaign.customersAcquired) || 0;
  const revenueGenerated = Number(campaign.revenueGenerated) || 0;
  const targetCac = Number(campaign.targetCac) || 100;

  const calculatedCac = customersAcquired > 0 ? Math.round(actualSpend / customersAcquired) : actualSpend;
  const roas = actualSpend > 0 ? Number((revenueGenerated / actualSpend).toFixed(2)) : (revenueGenerated > 0 ? 10 : 0);

  let status: AdCampaignItem['status'] = 'ACTIVE';
  let efficiencyGrade: AdCampaignItem['efficiencyGrade'] = 'B';
  let wasteRiskMonthly = 0;
  let auditNotes = '';
  let aiSuggestedAction = '';

  if (actualSpend === 0) {
    status = 'PAUSED';
    efficiencyGrade = 'C';
    wasteRiskMonthly = 0;
    auditNotes = 'Campaign has no active spend logged yet.';
    aiSuggestedAction = 'Set up test budget allocation or keep paused.';
  } else if (customersAcquired === 0 && actualSpend > 200) {
    status = 'FLAGGED_WASTE';
    efficiencyGrade = 'F_CRITICAL';
    wasteRiskMonthly = actualSpend;
    auditNotes = `Critical budget leak: Spent $${actualSpend.toLocaleString()} with 0 paying customers acquired.`;
    aiSuggestedAction = 'Immediate pause recommended. Re-audit landing page conversion or targeting audience.';
  } else if (roas < 1.2 || (targetCac > 0 && calculatedCac > targetCac * 1.6)) {
    status = 'FLAGGED_WASTE';
    efficiencyGrade = 'D';
    wasteRiskMonthly = Math.round(actualSpend * 0.65);
    auditNotes = `Negative ROI: ROAS is ${roas}x (below 1.2x threshold) and CAC ($${calculatedCac}) exceeds target ($${targetCac}) by ${Math.round(((calculatedCac - targetCac) / Math.max(targetCac, 1)) * 100)}%.`;
    aiSuggestedAction = `Cut monthly budget by 65% (saving $${wasteRiskMonthly.toLocaleString()}/mo) and migrate capital to higher-performing channels.`;
  } else if (roas >= 3.5 && (targetCac === 0 || calculatedCac <= targetCac)) {
    status = 'OPTIMIZED';
    efficiencyGrade = 'A+';
    wasteRiskMonthly = 0;
    auditNotes = `Elite performance: ${roas}x ROAS with pristine unit economics (CAC $${calculatedCac} <= Target $${targetCac}).`;
    aiSuggestedAction = 'Scale budget by 25-40% profitably. Margin headroom permits aggressive expansion.';
  } else if (roas >= 2.0) {
    status = 'ACTIVE';
    efficiencyGrade = 'B';
    wasteRiskMonthly = Math.round(actualSpend * 0.15);
    auditNotes = `Solid yield: ${roas}x ROAS. Minor creative fatigue optimization possible.`;
    aiSuggestedAction = `Maintain baseline budget. Refresh top 2 ad creatives to trim $${wasteRiskMonthly.toLocaleString()} in fatigue bleed.`;
  } else {
    status = 'ACTIVE';
    efficiencyGrade = 'C';
    wasteRiskMonthly = Math.round(actualSpend * 0.35);
    auditNotes = `Moderate efficiency: ${roas}x ROAS with CAC hovering near target threshold.`;
    aiSuggestedAction = 'A/B test offer headlines and tighten negative keywords to improve conversion rate.';
  }

  return {
    calculatedCac,
    roas,
    status,
    wasteRiskMonthly,
    efficiencyGrade,
    auditNotes,
    aiSuggestedAction,
  };
}

export async function fetchUserAdCampaigns(companyId: string, userId?: string): Promise<AdCampaignItem[]> {
  const compId = companyId || 'default_comp';

  // 1. Check Supabase 'ad_campaigns' table if available
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('company_id', compId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: AdCampaignItem[] = data.map((d: any) => {
          const metrics = computeAdCampaignMetrics({
            actualSpend: Number(d.actual_spend || d.actualSpend || 0),
            customersAcquired: Number(d.customers_acquired || d.customersAcquired || 0),
            revenueGenerated: Number(d.revenue_generated || d.revenueGenerated || 0),
            targetCac: Number(d.target_cac || d.targetCac || 100),
          });

          return {
            id: d.id,
            companyId: d.company_id || compId,
            userId: d.user_id || userId || 'user_anon',
            campaignName: d.campaign_name || d.campaignName,
            platform: d.platform,
            monthlyBudget: Number(d.monthly_budget || d.monthlyBudget || 0),
            actualSpend: Number(d.actual_spend || d.actualSpend || 0),
            leadsGenerated: Number(d.leads_generated || d.leadsGenerated || 0),
            customersAcquired: Number(d.customers_acquired || d.customersAcquired || 0),
            revenueGenerated: Number(d.revenue_generated || d.revenueGenerated || 0),
            targetCac: Number(d.target_cac || d.targetCac || 100),
            calculatedCac: metrics.calculatedCac,
            roas: metrics.roas,
            status: d.status || metrics.status,
            wasteRiskMonthly: metrics.wasteRiskMonthly,
            efficiencyGrade: metrics.efficiencyGrade,
            auditNotes: d.audit_notes || metrics.auditNotes,
            aiSuggestedAction: d.ai_suggested_action || metrics.aiSuggestedAction,
            createdAt: d.created_at || d.createdAt || new Date().toISOString(),
            updatedAt: d.updated_at || d.updatedAt,
          };
        });

        setLocalStore(`ad_campaigns_${compId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch ad_campaigns notice:', err);
  }

  // 2. Return local storage
  return getLocalStore<AdCampaignItem[]>(`ad_campaigns_${compId}`, []);
}

export async function saveAdCampaign(campaign: Omit<AdCampaignItem, 'id'> & { id?: string }): Promise<AdCampaignItem> {
  const compId = campaign.companyId || 'default_comp';
  const campaignId = campaign.id || `ad_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const metrics = computeAdCampaignMetrics(campaign);

  const fullCampaign: AdCampaignItem = {
    id: campaignId,
    companyId: compId,
    userId: campaign.userId || 'user_anon',
    campaignName: campaign.campaignName.trim(),
    platform: campaign.platform,
    monthlyBudget: Number(campaign.monthlyBudget) || 0,
    actualSpend: Number(campaign.actualSpend) || 0,
    leadsGenerated: Number(campaign.leadsGenerated) || 0,
    customersAcquired: Number(campaign.customersAcquired) || 0,
    revenueGenerated: Number(campaign.revenueGenerated) || 0,
    targetCac: Number(campaign.targetCac) || 100,
    calculatedCac: metrics.calculatedCac,
    roas: metrics.roas,
    status: campaign.status || metrics.status,
    wasteRiskMonthly: metrics.wasteRiskMonthly,
    efficiencyGrade: metrics.efficiencyGrade,
    auditNotes: metrics.auditNotes,
    aiSuggestedAction: metrics.aiSuggestedAction,
    createdAt: campaign.createdAt || now,
    updatedAt: now,
  };

  // 1. Update local storage
  const existing = getLocalStore<AdCampaignItem[]>(`ad_campaigns_${compId}`, []);
  const updated = [fullCampaign, ...existing.filter(c => c.id !== campaignId)];
  setLocalStore(`ad_campaigns_${compId}`, updated);

  // 2. Sync to Supabase 'ad_campaigns' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('ad_campaigns').upsert({
        id: campaignId,
        company_id: compId,
        user_id: fullCampaign.userId,
        campaign_name: fullCampaign.campaignName,
        platform: fullCampaign.platform,
        monthly_budget: fullCampaign.monthlyBudget,
        actual_spend: fullCampaign.actualSpend,
        leads_generated: fullCampaign.leadsGenerated,
        customers_acquired: fullCampaign.customersAcquired,
        revenue_generated: fullCampaign.revenueGenerated,
        target_cac: fullCampaign.targetCac,
        status: fullCampaign.status,
        audit_notes: fullCampaign.auditNotes,
        ai_suggested_action: fullCampaign.aiSuggestedAction,
        created_at: fullCampaign.createdAt,
        updated_at: now,
      });
    }
  } catch (e) {
    console.warn('Supabase save ad_campaigns notice:', e);
  }

  // 3. Log Activity
  logActivity({
    companyId: compId,
    userId: fullCampaign.userId,
    type: 'DEAL_UPDATED',
    title: `Ad Spend Audited: ${fullCampaign.campaignName}`,
    description: `${fullCampaign.platform} — ROAS: ${fullCampaign.roas}x, CAC: $${fullCampaign.calculatedCac}. Waste identified: $${fullCampaign.wasteRiskMonthly}/mo.`,
    timestamp: now,
  }).catch(() => {});

  return fullCampaign;
}

export async function deleteAdCampaign(campaignId: string, companyId: string): Promise<void> {
  const compId = companyId || 'default_comp';
  const existing = getLocalStore<AdCampaignItem[]>(`ad_campaigns_${compId}`, []);
  const updated = existing.filter(c => c.id !== campaignId);
  setLocalStore(`ad_campaigns_${compId}`, updated);

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('ad_campaigns').delete().eq('id', campaignId).eq('company_id', compId);
    }
  } catch (e) {}
}

// =========================================================================
// 4. OVERDUE INVOICES & CASH FLOW GUARD SERVICE (ZERO FAKE DATA)
// =========================================================================

export function calculateGatewayFees(amount: number, gateway: PaymentGatewayType): number {
  if (amount <= 0) return 0;
  switch (gateway) {
    case 'Stripe (2.9% + $0.30)':
      return Number(((amount * 0.029) + 0.30).toFixed(2));
    case 'PayPal (3.49% + $0.49)':
      return Number(((amount * 0.0349) + 0.49).toFixed(2));
    case 'Wise / ACH Bank Transfer (0.4% Cap $5)':
      return Number(Math.min(amount * 0.004, 5.00).toFixed(2));
    case 'Payoneer (1.5% - 2%)':
      return Number((amount * 0.018).toFixed(2));
    case 'Direct Wire / Swift (Fixed $15 - $25)':
      return 20.00;
    case 'Local Bank Transfer (0%)':
      return 0.00;
    default:
      return Number(((amount * 0.029) + 0.30).toFixed(2));
  }
}

export function recommendOptimalGateway(amount: number, currentGateway: PaymentGatewayType): {
  recommendedGateway: PaymentGatewayType;
  optimizedGatewayFee: number;
  currentGatewayFee: number;
  feeSavingsAmount: number;
} {
  const currentFee = calculateGatewayFees(amount, currentGateway);
  let recommended: PaymentGatewayType = 'Local Bank Transfer (0%)';

  if (amount >= 2000) {
    recommended = 'Wise / ACH Bank Transfer (0.4% Cap $5)';
  } else if (amount >= 500) {
    recommended = 'Wise / ACH Bank Transfer (0.4% Cap $5)';
  } else {
    recommended = 'Stripe (2.9% + $0.30)';
  }

  const optimizedFee = calculateGatewayFees(amount, recommended);
  const feeSavingsAmount = Number(Math.max(0, currentFee - optimizedFee).toFixed(2));

  return {
    recommendedGateway: recommended,
    optimizedGatewayFee: optimizedFee,
    currentGatewayFee: currentFee,
    feeSavingsAmount,
  };
}

export function computeInvoiceDaysOverdue(dueDate: string, status: InvoiceItem['status']): {
  daysOverdue: number;
  computedStatus: InvoiceItem['status'];
} {
  if (status === 'PAID') {
    return { daysOverdue: 0, computedStatus: 'PAID' };
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0 && status !== 'DISPUTED') {
    return { daysOverdue: diffDays, computedStatus: 'OVERDUE' };
  }

  return { daysOverdue: Math.max(0, diffDays), computedStatus: status };
}

export async function fetchUserInvoices(companyId: string, userId?: string): Promise<InvoiceItem[]> {
  const compId = companyId || 'default_comp';

  // 1. Supabase 'invoices' table query
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', compId)
        .order('due_date', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: InvoiceItem[] = data.map((d: any) => {
          const rawStatus = (d.status || 'UNPAID') as InvoiceItem['status'];
          const { daysOverdue, computedStatus } = computeInvoiceDaysOverdue(d.due_date || d.dueDate, rawStatus);
          const amount = Number(d.amount || 0);
          const gateway = (d.selected_gateway || d.selectedGateway || 'Stripe (2.9% + $0.30)') as PaymentGatewayType;
          const feeAnalysis = recommendOptimalGateway(amount, gateway);

          return {
            id: d.id,
            companyId: d.company_id || compId,
            userId: d.user_id || userId || 'user_anon',
            invoiceNumber: d.invoice_number || d.invoiceNumber,
            clientName: d.client_name || d.clientName,
            clientEmail: d.client_email || d.clientEmail,
            clientPhone: d.client_phone || d.clientPhone,
            clientCompany: d.client_company || d.clientCompany,
            amount,
            currency: d.currency || 'USD',
            issueDate: d.issue_date || d.issueDate,
            dueDate: d.due_date || d.dueDate,
            status: computedStatus,
            daysOverdue,
            paidAmount: d.paid_amount || d.paidAmount,
            paidDate: d.paid_date || d.paidDate,
            selectedGateway: gateway,
            currentGatewayFee: feeAnalysis.currentGatewayFee,
            recommendedGateway: feeAnalysis.recommendedGateway,
            optimizedGatewayFee: feeAnalysis.optimizedGatewayFee,
            feeSavingsAmount: feeAnalysis.feeSavingsAmount,
            reminderCount: Number(d.reminder_count || d.reminderCount || 0),
            lastReminderSentAt: d.last_reminder_sent_at || d.lastReminderSentAt,
            notes: d.notes,
            createdAt: d.created_at || d.createdAt || new Date().toISOString(),
            updatedAt: d.updated_at || d.updatedAt,
          };
        });

        setLocalStore(`invoices_${compId}`, mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch invoices notice:', err);
  }

  // 2. Return local storage with dynamically checked overdue status
  const localList = getLocalStore<InvoiceItem[]>(`invoices_${compId}`, []);
  return localList.map(inv => {
    const { daysOverdue, computedStatus } = computeInvoiceDaysOverdue(inv.dueDate, inv.status);
    const feeAnalysis = recommendOptimalGateway(inv.amount, inv.selectedGateway);
    return {
      ...inv,
      daysOverdue,
      status: computedStatus,
      currentGatewayFee: feeAnalysis.currentGatewayFee,
      recommendedGateway: feeAnalysis.recommendedGateway,
      optimizedGatewayFee: feeAnalysis.optimizedGatewayFee,
      feeSavingsAmount: feeAnalysis.feeSavingsAmount,
    };
  });
}

export async function saveInvoice(invoice: Omit<InvoiceItem, 'id'> & { id?: string }): Promise<InvoiceItem> {
  const compId = invoice.companyId || 'default_comp';
  const invoiceId = invoice.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const { daysOverdue, computedStatus } = computeInvoiceDaysOverdue(invoice.dueDate, invoice.status);
  const amount = Number(invoice.amount) || 0;
  const gateway = invoice.selectedGateway || 'Stripe (2.9% + $0.30)';
  const feeAnalysis = recommendOptimalGateway(amount, gateway);

  const fullInvoice: InvoiceItem = {
    id: invoiceId,
    companyId: compId,
    userId: invoice.userId || 'user_anon',
    invoiceNumber: invoice.invoiceNumber.trim(),
    clientName: invoice.clientName.trim(),
    clientEmail: invoice.clientEmail.trim(),
    clientPhone: invoice.clientPhone?.trim(),
    clientCompany: invoice.clientCompany?.trim(),
    amount,
    currency: invoice.currency || 'USD',
    issueDate: invoice.issueDate || now.split('T')[0],
    dueDate: invoice.dueDate,
    status: computedStatus,
    daysOverdue,
    paidAmount: invoice.paidAmount,
    paidDate: invoice.paidDate,
    selectedGateway: gateway,
    currentGatewayFee: feeAnalysis.currentGatewayFee,
    recommendedGateway: feeAnalysis.recommendedGateway,
    optimizedGatewayFee: feeAnalysis.optimizedGatewayFee,
    feeSavingsAmount: feeAnalysis.feeSavingsAmount,
    reminderCount: Number(invoice.reminderCount) || 0,
    lastReminderSentAt: invoice.lastReminderSentAt,
    notes: invoice.notes,
    createdAt: invoice.createdAt || now,
    updatedAt: now,
  };

  // 1. Update local storage
  const existing = getLocalStore<InvoiceItem[]>(`invoices_${compId}`, []);
  const updated = [fullInvoice, ...existing.filter(i => i.id !== invoiceId)];
  setLocalStore(`invoices_${compId}`, updated);

  // 2. Sync to Supabase 'invoices' table
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('invoices').upsert({
        id: invoiceId,
        company_id: compId,
        user_id: fullInvoice.userId,
        invoice_number: fullInvoice.invoiceNumber,
        client_name: fullInvoice.clientName,
        client_email: fullInvoice.clientEmail,
        client_phone: fullInvoice.clientPhone,
        client_company: fullInvoice.clientCompany,
        amount: fullInvoice.amount,
        currency: fullInvoice.currency,
        issue_date: fullInvoice.issueDate,
        due_date: fullInvoice.dueDate,
        status: fullInvoice.status,
        paid_amount: fullInvoice.paidAmount,
        paid_date: fullInvoice.paidDate,
        selected_gateway: fullInvoice.selectedGateway,
        reminder_count: fullInvoice.reminderCount,
        last_reminder_sent_at: fullInvoice.lastReminderSentAt,
        notes: fullInvoice.notes,
        created_at: fullInvoice.createdAt,
        updated_at: now,
      });
    }
  } catch (e) {
    console.warn('Supabase save invoices notice:', e);
  }

  // 3. Log Activity
  logActivity({
    companyId: compId,
    userId: fullInvoice.userId,
    type: 'DEAL_CREATED',
    title: `Invoice Logged: #${fullInvoice.invoiceNumber}`,
    description: `${fullInvoice.clientName} (${fullInvoice.currency} ${fullInvoice.amount.toLocaleString()}) — Due: ${fullInvoice.dueDate}`,
    timestamp: now,
  }).catch(() => {});

  return fullInvoice;
}

export async function fetchInvoiceById(
  invoiceIdOrNumber: string, 
  preferredCompanyId?: string
): Promise<InvoiceItem | null> {
  const query = invoiceIdOrNumber.trim().toLowerCase();
  
  // 1. Check preferred company first
  if (preferredCompanyId) {
    const list = getLocalStore<InvoiceItem[]>(`invoices_${preferredCompanyId}`, []);
    const match = list.find(i => i.id.toLowerCase() === query || i.invoiceNumber.toLowerCase() === query);
    if (match) return match;
  }

  // 2. Scan all known company caches in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('prime_invoices_')) {
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]') as InvoiceItem[];
        const found = items.find(inv => inv.id.toLowerCase() === query || inv.invoiceNumber.toLowerCase() === query);
        if (found) return found;
      } catch (e) {}
    }
  }

  // 3. Try Supabase
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .or(`id.eq.${invoiceIdOrNumber},invoice_number.ilike.${invoiceIdOrNumber}`)
        .limit(1)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          companyId: data.company_id,
          userId: data.user_id,
          invoiceNumber: data.invoice_number,
          clientName: data.client_name,
          clientEmail: data.client_email,
          clientPhone: data.client_phone,
          clientCompany: data.client_company,
          amount: data.amount,
          currency: data.currency || 'USD',
          issueDate: data.issue_date,
          dueDate: data.due_date,
          status: data.status,
          daysOverdue: 0,
          paidAmount: data.paid_amount,
          paidDate: data.paid_date,
          selectedGateway: (data.selected_gateway as PaymentGatewayType) || 'Stripe (2.9% + $0.30)',
          currentGatewayFee: 0,
          recommendedGateway: 'Wise / ACH Bank Transfer (0.4% Cap $5)',
          optimizedGatewayFee: 0,
          feeSavingsAmount: 0,
          reminderCount: data.reminder_count || 0,
          lastReminderSentAt: data.last_reminder_sent_at,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  } catch (e) {}

  return null;
}

export async function recordClientSelfServicePayment(
  invoiceId: string,
  companyId: string,
  paymentDetails: {
    method: 'STRIPE_CARD' | 'BANK_TRANSFER' | 'WISE' | 'PAYPAL' | 'APPLE_PAY';
    payerName: string;
    payerEmail: string;
    transactionReference?: string;
    amount?: number;
  }
): Promise<InvoiceItem | null> {
  const compId = companyId || 'default_comp';
  const existing = getLocalStore<InvoiceItem[]>(`invoices_${compId}`, []);
  const target = existing.find(i => i.id === invoiceId);
  
  if (!target) {
    // If not found in primary company, search all local stores
    const foundAnywhere = await fetchInvoiceById(invoiceId);
    if (!foundAnywhere) return null;
    return recordClientSelfServicePayment(foundAnywhere.id, foundAnywhere.companyId, paymentDetails);
  }

  const now = new Date().toISOString();
  const txRef = paymentDetails.transactionReference || `TXN-CLIENT-${Date.now().toString(36).toUpperCase()}`;
  const amountPaid = paymentDetails.amount !== undefined ? paymentDetails.amount : target.amount;

  const updatedInvoice: InvoiceItem = {
    ...target,
    status: 'PAID',
    daysOverdue: 0,
    paidAmount: amountPaid,
    paidDate: now,
    notes: (target.notes ? target.notes + '\n\n' : '') + 
      `[Self-Service Payment]: Paid ${target.currency} ${amountPaid.toLocaleString()} via ${paymentDetails.method}. Ref: ${txRef}. Payer: ${paymentDetails.payerName} (${paymentDetails.payerEmail}) at ${now}`,
    updatedAt: now,
  };

  const updatedList = existing.map(i => i.id === invoiceId ? updatedInvoice : i);
  setLocalStore(`invoices_${compId}`, updatedList);

  // Sync to Supabase
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('invoices').update({
        status: 'PAID',
        paid_amount: updatedInvoice.paidAmount,
        paid_date: now,
        notes: updatedInvoice.notes,
        updated_at: now,
      }).eq('id', invoiceId).eq('company_id', compId);
    }
  } catch (e) {}

  // Log Activity for Business Dashboard
  logActivity({
    companyId: compId,
    userId: target.userId || 'client_self_service',
    type: 'DEAL_WON',
    title: `Instant Client Payment: #${target.invoiceNumber}`,
    description: `Client ${paymentDetails.payerName} completed self-service settlement of ${target.currency} ${amountPaid.toLocaleString()} via ${paymentDetails.method} (Ref: ${txRef}). Zero admin approval needed.`,
    timestamp: now,
  }).catch(() => {});

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime_invoice_paid', { 
      detail: { invoiceId, companyId: compId, invoice: updatedInvoice, txRef } 
    }));
  }

  return updatedInvoice;
}

export async function submitClientInboundEmail(payload: {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  companyId?: string;
  category?: 'CLIENT' | 'VENDOR' | 'INVESTOR' | 'TEAM' | 'LEGAL';
}): Promise<{ success: boolean; emailId: string; message: string }> {
  const compId = payload.companyId || localStorage.getItem('prime_ai_active_company_id') || 'comp_apex_01';
  const now = new Date().toISOString();

  // Instant autonomous AI preview / analysis
  const snippet = payload.message.slice(0, 140) + (payload.message.length > 140 ? '...' : '');
  const aiKeyTakeaway = `Direct client outreach from ${payload.senderName} (${payload.senderEmail}) regarding "${payload.subject}". Instant receipt acknowledged to client.`;
  const aiDraftReply = `Dear ${payload.senderName},\n\nThank you for contacting us regarding "${payload.subject}". We have received your inquiry and our executive team is reviewing your message.\n\nWe will get back to you shortly.\n\nBest regards,\nExecutive Support Team`;

  const newEmail: EmailItem = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    companyId: compId,
    userId: 'client_inbound',
    sender: payload.senderName.trim(),
    senderEmail: payload.senderEmail.trim(),
    subject: payload.subject.trim(),
    snippet,
    fullBody: payload.message.trim(),
    urgency: 'HIGH',
    category: payload.category || 'CLIENT',
    status: 'PENDING_REVIEW',
    receivedAt: now,
    aiDraftReply,
    aiKeyTakeaway,
    aiSuggestedAction: 'Immediate client outreach / inquiry. Auto-received without admin gating.'
  };

  const list = getLocalStore<EmailItem[]>(`emails_${compId}`, []);
  list.unshift(newEmail);
  setLocalStore(`emails_${compId}`, list);

  // Sync to Supabase
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('inbox').upsert({
        id: newEmail.id,
        company_id: compId,
        user_id: newEmail.userId,
        sender: newEmail.sender,
        sender_email: newEmail.senderEmail,
        subject: newEmail.subject,
        snippet: newEmail.snippet,
        full_body: newEmail.fullBody,
        urgency: newEmail.urgency,
        category: newEmail.category,
        status: newEmail.status,
        received_at: newEmail.receivedAt,
        ai_draft_reply: newEmail.aiDraftReply,
        ai_key_takeaway: newEmail.aiKeyTakeaway,
        ai_suggested_action: newEmail.aiSuggestedAction,
      });
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime_email_status_updated', { 
      detail: { emailId: newEmail.id, status: 'RECEIVED', email: newEmail } 
    }));
  }

  return {
    success: true,
    emailId: newEmail.id,
    message: 'Your message has been delivered directly to the executive inbox!'
  };
}

export async function markInvoiceAsPaid(
  invoiceId: string, 
  companyId: string, 
  amountPaid?: number
): Promise<InvoiceItem | null> {
  const compId = companyId || 'default_comp';
  const existing = getLocalStore<InvoiceItem[]>(`invoices_${compId}`, []);
  const target = existing.find(i => i.id === invoiceId);
  if (!target) return null;

  const now = new Date().toISOString();
  const updatedInvoice: InvoiceItem = {
    ...target,
    status: 'PAID',
    daysOverdue: 0,
    paidAmount: amountPaid !== undefined ? amountPaid : target.amount,
    paidDate: now,
    updatedAt: now,
  };

  const updatedList = existing.map(i => i.id === invoiceId ? updatedInvoice : i);
  setLocalStore(`invoices_${compId}`, updatedList);

  // Sync to Supabase
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('invoices').update({
        status: 'PAID',
        paid_amount: updatedInvoice.paidAmount,
        paid_date: now,
        updated_at: now,
      }).eq('id', invoiceId).eq('company_id', compId);
    }
  } catch (e) {}

  // Log Activity
  logActivity({
    companyId: compId,
    userId: updatedInvoice.userId,
    type: 'DEAL_WON',
    title: `Invoice Paid & Recovered: #${updatedInvoice.invoiceNumber}`,
    description: `Collected ${updatedInvoice.currency} ${updatedInvoice.amount.toLocaleString()} from ${updatedInvoice.clientName}.`,
    timestamp: now,
  }).catch(() => {});

  return updatedInvoice;
}

export async function recordPaymentReminderSent(
  invoiceId: string,
  companyId: string
): Promise<void> {
  const compId = companyId || 'default_comp';
  const existing = getLocalStore<InvoiceItem[]>(`invoices_${compId}`, []);
  const now = new Date().toISOString();

  const updatedList = existing.map(i => {
    if (i.id === invoiceId) {
      return {
        ...i,
        reminderCount: (i.reminderCount || 0) + 1,
        lastReminderSentAt: now,
        updatedAt: now,
      };
    }
    return i;
  });

  setLocalStore(`invoices_${compId}`, updatedList);

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const inv = updatedList.find(i => i.id === invoiceId);
      if (inv) {
        await supabase.from('invoices').update({
          reminder_count: inv.reminderCount,
          last_reminder_sent_at: now,
          updated_at: now,
        }).eq('id', invoiceId).eq('company_id', compId);
      }
    }
  } catch (e) {}
}

export async function deleteInvoice(invoiceId: string, companyId: string): Promise<void> {
  const compId = companyId || 'default_comp';
  const existing = getLocalStore<InvoiceItem[]>(`invoices_${compId}`, []);
  const updated = existing.filter(i => i.id !== invoiceId);
  setLocalStore(`invoices_${compId}`, updated);

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('invoices').delete().eq('id', invoiceId).eq('company_id', compId);
    }
  } catch (e) {}
}

// ----------------------------------------------------
// FEEDBACK, COMPLAINTS & FEATURE REQUESTS SERVICE
// ----------------------------------------------------

const INITIAL_DEMO_FEEDBACKS: FeedbackTicket[] = [];

export async function fetchAllFeedbacks(): Promise<FeedbackTicket[]> {
  const local = getLocalStore<FeedbackTicket[]>('all_feedback_tickets', []).filter(t => !t.id.startsWith('tkt_demo_'));
  
  try {
    const feedbackRef = collection(db, 'feedback_tickets');
    const snapshot = await getDocs(query(feedbackRef, orderBy('createdAt', 'desc')));
    if (!snapshot.empty) {
      const tickets: FeedbackTicket[] = [];
      snapshot.forEach(d => tickets.push({ id: d.id, ...d.data() } as FeedbackTicket));
      setLocalStore('all_feedback_tickets', tickets);
      return tickets;
    }
  } catch (e) {
    // fallback to local
  }

  return local;
}

export async function fetchCompanyFeedbacks(companyId: string): Promise<FeedbackTicket[]> {
  const all = await fetchAllFeedbacks();
  if (!companyId) return all;
  return all.filter(t => t.companyId === companyId);
}

export async function submitFeedbackTicket(
  ticketData: Omit<FeedbackTicket, 'id' | 'createdAt' | 'upvotes' | 'status'>
): Promise<FeedbackTicket> {
  const id = 'tkt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  const now = new Date().toISOString();

  const newTicket: FeedbackTicket = {
    ...ticketData,
    id,
    status: 'PENDING',
    upvotes: 1,
    upvotedBy: [ticketData.userId],
    createdAt: now,
    updatedAt: now
  };

  const existing = await fetchAllFeedbacks();
  const updated = [newTicket, ...existing];
  setLocalStore('all_feedback_tickets', updated);

  try {
    await setDoc(doc(db, 'feedback_tickets', id), newTicket);
  } catch (e) {}

  // Log activity
  logActivity({
    companyId: ticketData.companyId,
    userId: ticketData.userId,
    type: 'SETTINGS_UPDATED',
    title: `Ticket Submitted: [${ticketData.type}] ${ticketData.title}`,
    description: `Submitted to the engineering roadmap. Category: ${ticketData.category}.`,
    timestamp: now
  }).catch(() => {});

  return newTicket;
}

export async function updateFeedbackStatus(
  ticketId: string,
  status: FeedbackStatus,
  adminReply?: string,
  targetReleaseVersion?: string
): Promise<FeedbackTicket | null> {
  const existing = await fetchAllFeedbacks();
  const now = new Date().toISOString();
  let updatedTicket: FeedbackTicket | null = null;

  const updatedList = existing.map(t => {
    if (t.id === ticketId) {
      updatedTicket = {
        ...t,
        status,
        adminReply: adminReply !== undefined ? adminReply : t.adminReply,
        targetReleaseVersion: targetReleaseVersion !== undefined ? targetReleaseVersion : t.targetReleaseVersion,
        resolvedAt: status === 'RESOLVED' ? now : t.resolvedAt,
        updatedAt: now
      };
      return updatedTicket;
    }
    return t;
  });

  setLocalStore('all_feedback_tickets', updatedList);

  try {
    if (updatedTicket) {
      await updateDoc(doc(db, 'feedback_tickets', ticketId), { ...(updatedTicket as any) });
    }
  } catch (e) {}

  return updatedTicket;
}

export async function upvoteFeedbackTicket(ticketId: string, userId: string): Promise<FeedbackTicket | null> {
  const existing = await fetchAllFeedbacks();
  const now = new Date().toISOString();
  let targetTicket: FeedbackTicket | null = null;

  const updatedList = existing.map(t => {
    if (t.id === ticketId) {
      const upvotedBy = t.upvotedBy || [];
      const hasUpvoted = upvotedBy.includes(userId);
      const newUpvotedBy = hasUpvoted ? upvotedBy.filter(id => id !== userId) : [...upvotedBy, userId];
      const newCount = newUpvotedBy.length;

      targetTicket = {
        ...t,
        upvotes: newCount,
        upvotedBy: newUpvotedBy,
        updatedAt: now
      };
      return targetTicket;
    }
    return t;
  });

  setLocalStore('all_feedback_tickets', updatedList);

  try {
    if (targetTicket) {
      await updateDoc(doc(db, 'feedback_tickets', ticketId), {
        upvotes: (targetTicket as FeedbackTicket).upvotes,
        upvotedBy: (targetTicket as FeedbackTicket).upvotedBy,
        updatedAt: now
      });
    }
  } catch (e) {}

  return targetTicket;
}

export async function fetchChangelogs(): Promise<ChangelogItem[]> {
  return [
    {
      version: 'v2.3.0',
      releaseDate: 'Current Active Version',
      title: 'Mobile Header Enhancement & Real-Time Cash Flow Audit',
      description: 'Major platform update delivering multi-currency fee protection, 1-click Payoneer integration, and client ROI simulation.',
      tag: 'MAJOR',
      changes: [
        'Optimized mobile navigation bar to prioritize PRIME Command Center with 2-line clarity.',
        'Integrated Cash Flow Guard with automated Stripe & Payoneer fee optimization.',
        'Added high-ticket ROI Calculator with dynamic client profit simulation.',
        'Launched Customer Complaints & Feature Request Voting Hub.'
      ]
    },
    {
      version: 'v2.2.0',
      releaseDate: 'August 2026',
      title: 'Ad Spend Optimizer & Multi-Tenant Reseller Portal',
      description: 'Enterprise advertising intelligence and white-label client portal infrastructure.',
      tag: 'FEATURE',
      requestedByCompany: 'Vanguard Media Group',
      changes: [
        'Added 1-click leak detection for Google & Meta Ads budget waste.',
        'White-label portal now supports custom CNAME domains and client login branding.',
        'Added automated CEO Briefing voice synthesis in 5 executive tones.'
      ]
    }
  ];
}

// =========================================================================
// 12. REAL-TIME VISITOR & SESSION TRAFFIC INTELLIGENCE (DEMO VS REGISTERED)
// =========================================================================

function detectVisitorDevice(): { deviceType: 'Desktop' | 'Mobile' | 'Tablet'; browser: string } {
  if (typeof window === 'undefined') {
    return { deviceType: 'Desktop', browser: 'Chrome' };
  }
  const ua = navigator.userAgent || '';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    deviceType = 'Mobile';
  }

  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

  return { deviceType, browser };
}

function detectReferrer(): string {
  if (typeof document === 'undefined') return 'Direct Access';
  const ref = document.referrer;
  if (!ref) return 'Direct / Link Share';
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes('t.co') || host.includes('twitter') || host.includes('x.com')) return 'Twitter / X';
    if (host.includes('linkedin.com') || host.includes('lnkd.in')) return 'LinkedIn';
    if (host.includes('google')) return 'Google Search';
    if (host.includes('facebook') || host.includes('instagram')) return 'Meta / Instagram';
    if (host.includes('reddit')) return 'Reddit';
    return url.hostname;
  } catch (e) {
    return 'Web Referral';
  }
}

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const VISITOR_SESSION_STORAGE_KEY = 'prime_active_session_id';

export function getOrCreateSessionId(): string {
  const todayKey = getTodayDateKey();
  try {
    const existing = sessionStorage.getItem(VISITOR_SESSION_STORAGE_KEY);
    if (existing && existing.startsWith(`sess_${todayKey}`)) {
      return existing;
    }
    const newId = `sess_${todayKey}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem(VISITOR_SESSION_STORAGE_KEY, newId);
    return newId;
  } catch (e) {
    return `sess_${todayKey}_${Date.now().toString(36)}`;
  }
}

export interface LogVisitorOptions {
  visitorType: VisitorType;
  userId?: string;
  userEmail?: string;
  userName?: string;
  companyId?: string;
  companyName?: string;
  entryPath?: string;
}

export async function logVisitorSession(options: LogVisitorOptions): Promise<VisitorSessionRecord> {
  const sessionId = getOrCreateSessionId();
  const dateKey = getTodayDateKey();
  const now = new Date().toISOString();
  const { deviceType, browser } = detectVisitorDevice();
  const referrer = detectReferrer();

  const existingSessions = getLocalStore<VisitorSessionRecord[]>('all_visitor_sessions', []);
  const existing = existingSessions.find(s => s.id === sessionId);

  const isSignupConversion = existing && existing.visitorType === 'DEMO_GUEST' && options.visitorType === 'REGISTERED_ACCOUNT';

  const record: VisitorSessionRecord = {
    id: sessionId,
    visitorType: options.visitorType,
    userId: options.userId || existing?.userId,
    userEmail: options.userEmail || existing?.userEmail,
    userName: options.userName || existing?.userName,
    companyId: options.companyId || existing?.companyId,
    companyName: options.companyName || existing?.companyName,
    entryPath: options.entryPath || existing?.entryPath || '/',
    deviceType: deviceType,
    browser: browser,
    referrer: referrer,
    timestamp: existing ? existing.timestamp : now,
    dateKey: dateKey,
    actionsCount: (existing?.actionsCount || 0) + 1,
    lastActiveAt: now,
    convertedToSignup: isSignupConversion || existing?.convertedToSignup || false,
  };

  const updatedSessions = [record, ...existingSessions.filter(s => s.id !== sessionId)];
  setLocalStore('all_visitor_sessions', updatedSessions);

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'visitor_sessions', sessionId), record, { merge: true });
  } catch (e) {
    // Local fallback resilient
  }

  return record;
}

export async function purgeAllMockDataAndResetLive(): Promise<void> {
  // Purge all synthetic visitor telemetry
  setLocalStore('all_visitor_sessions', []);
  // Clean all fake companies except real user's workspace
  setLocalStore('all_companies', []);
  // Clean feedback tickets
  setLocalStore('all_feedback_tickets', []);
  // Clean synthetic deals
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k.startsWith('prime_crm_records_company_comp_demo_') || k.startsWith('prime_crm_records_company_comp_apex_01')) {
      // clean mock deals
      localStorage.setItem(k, '[]');
    }
  }
}

export async function deleteAdminUserAccount(userRecord: { uid: string; email: string; companyId?: string }): Promise<void> {
  const targetEmail = userRecord.email.trim().toLowerCase();
  
  // 1. Delete from Firestore 'profiles'
  try {
    if (userRecord.uid) {
      await deleteDoc(doc(db, 'profiles', userRecord.uid));
    }
    // Also check if any profile exists with this email
    const profQ = query(collection(db, 'profiles'), where('email', '==', targetEmail));
    const profSnap = await getDocs(profQ);
    for (const d of profSnap.docs) {
      await deleteDoc(doc(db, 'profiles', d.id));
    }
  } catch (e) {
    console.warn('Firestore profile deletion notice:', e);
  }

  // 2. Delete from Firestore 'admin_leads'
  try {
    const leadId = 'lead_' + targetEmail.replace(/[^a-zA-Z0-9]/g, '_');
    await deleteDoc(doc(db, 'admin_leads', leadId));
    
    // Also delete any leads with matching email
    const leadsQ = query(collection(db, 'admin_leads'), where('email', '==', targetEmail));
    const leadsSnap = await getDocs(leadsQ);
    for (const d of leadsSnap.docs) {
      await deleteDoc(doc(db, 'admin_leads', d.id));
    }
  } catch (e) {
    console.warn('Firestore admin_leads deletion notice:', e);
  }

  // 3. Delete from Supabase if available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('users').delete().eq('email', targetEmail);
    } catch (e) {}
  }

  // 4. Clean from local storage registered accounts
  try {
    const rawAccounts = localStorage.getItem('prime_ai_registered_accounts');
    if (rawAccounts) {
      const accounts = JSON.parse(rawAccounts);
      delete accounts[targetEmail];
      localStorage.setItem('prime_ai_registered_accounts', JSON.stringify(accounts));
    }
  } catch (e) {}

  // 5. Clean from local storage leads cache
  try {
    const rawLeads = localStorage.getItem('prime_cached_admin_leads');
    if (rawLeads) {
      const leads = JSON.parse(rawLeads);
      const filtered = leads.filter((l: any) => l.email?.toLowerCase() !== targetEmail);
      localStorage.setItem('prime_cached_admin_leads', JSON.stringify(filtered));
    }
  } catch (e) {}

  // 6. Clean from visitor sessions
  try {
    const existingSessions = getLocalStore<VisitorSessionRecord[]>('all_visitor_sessions', []);
    const filteredSessions = existingSessions.filter(s => s.userEmail?.toLowerCase() !== targetEmail);
    setLocalStore('all_visitor_sessions', filteredSessions);
  } catch (e) {}
}

export async function deleteVisitorSession(sessionId: string): Promise<void> {
  const existing = getLocalStore<VisitorSessionRecord[]>('all_visitor_sessions', []);
  const updated = existing.filter(s => s.id !== sessionId);
  setLocalStore('all_visitor_sessions', updated);

  try {
    await deleteDoc(doc(db, 'visitor_sessions', sessionId));
  } catch (e) {
    console.warn('Firestore session delete notice:', e);
  }
}

export async function purgeDuplicateAdnanAccountsAndSessions(): Promise<{ deletedSessions: number; deletedAccounts: number }> {
  let deletedSessions = 0;
  let deletedAccounts = 0;

  // 1. Clean localStorage visitor sessions for duplicate Adnan Khan and mock Alexander Vance records
  const existingSessions = getLocalStore<VisitorSessionRecord[]>('all_visitor_sessions', []);
  let keptOneAdnanSession = false;
  const filteredSessions: VisitorSessionRecord[] = [];

  for (const s of existingSessions) {
    const isAdnan = (s.userEmail && s.userEmail.toLowerCase().includes('adnan')) ||
                    (s.userName && s.userName.toLowerCase().includes('adnan'));
    const isAlexander = (s.userEmail && s.userEmail.toLowerCase().includes('apexenterprise.com')) ||
                        (s.userName && s.userName.toLowerCase().includes('alexander'));
    if (isAdnan) {
      if (!keptOneAdnanSession) {
        // Keep strictly this one latest master admin session
        filteredSessions.push({
          ...s,
          userName: 'Adnan Khan',
          userEmail: 'adnanakhan245@gmail.com',
          visitorType: 'REGISTERED_ACCOUNT',
          companyName: 'Apex Enterprises (HQ)'
        });
        keptOneAdnanSession = true;
      } else {
        deletedSessions++;
        // Delete duplicate session from Firestore
        deleteDoc(doc(db, 'visitor_sessions', s.id)).catch(() => {});
      }
    } else if (isAlexander) {
      // Purge fake demo alexander accounts from active telemetry
      deletedSessions++;
      deleteDoc(doc(db, 'visitor_sessions', s.id)).catch(() => {});
    } else {
      filteredSessions.push(s);
    }
  }
  setLocalStore('all_visitor_sessions', filteredSessions);

  // 2. Clean Firestore visitor_sessions duplicates
  try {
    const colRef = collection(db, 'visitor_sessions');
    const snap = await getDocs(query(colRef, limit(100)));
    let keptFirestoreAdnan = false;
    for (const d of snap.docs) {
      const data = d.data() as VisitorSessionRecord;
      const isAdnan = (data.userEmail && data.userEmail.toLowerCase().includes('adnan')) ||
                      (data.userName && data.userName.toLowerCase().includes('adnan'));
      const isAlexander = (data.userEmail && data.userEmail.toLowerCase().includes('apexenterprise.com')) ||
                          (data.userName && data.userName.toLowerCase().includes('alexander'));
      if (isAdnan) {
        if (!keptFirestoreAdnan) {
          keptFirestoreAdnan = true;
        } else {
          deletedSessions++;
          await deleteDoc(doc(db, 'visitor_sessions', d.id));
        }
      } else if (isAlexander) {
        deletedSessions++;
        await deleteDoc(doc(db, 'visitor_sessions', d.id));
      }
    }
  } catch (e) {}

  // 2b. Clean fake Alexander Vance from Firestore 'profiles' and 'admin_leads'
  try {
    const profSnap = await getDocs(query(collection(db, 'profiles'), limit(100)));
    for (const d of profSnap.docs) {
      const p = d.data() as any;
      if (p?.email?.toLowerCase().includes('ceo@apexenterprise.com') || p?.displayName?.toLowerCase().includes('alexander')) {
        deletedAccounts++;
        await deleteDoc(doc(db, 'profiles', d.id));
      }
    }
  } catch (e) {}

  try {
    const leadsSnap = await getDocs(query(collection(db, 'admin_leads'), limit(100)));
    for (const d of leadsSnap.docs) {
      const l = d.data() as any;
      if (l?.email?.toLowerCase().includes('ceo@apexenterprise.com') || l?.fullName?.toLowerCase().includes('alexander')) {
        deletedAccounts++;
        await deleteDoc(doc(db, 'admin_leads', d.id));
      }
    }
  } catch (e) {}

  // 3. Clean registered accounts stored in localStorage
  try {
    const raw = localStorage.getItem('prime_ai_registered_accounts');
    if (raw) {
      const accounts = JSON.parse(raw);
      const cleaned: Record<string, any> = {};
      let keptMain = false;
      for (const [key, acc] of Object.entries<any>(accounts)) {
        const isAdnan = key.toLowerCase().includes('adnan') || (acc.email && acc.email.toLowerCase().includes('adnan'));
        const isAlexander = key.toLowerCase().includes('apexenterprise') || key.toLowerCase().includes('alexander');
        if (isAdnan) {
          if (!keptMain) {
            cleaned['adnanakhan245@gmail.com'] = {
              ...acc,
              email: 'adnanakhan245@gmail.com',
              fullName: 'Adnan Khan',
              role: 'Master Admin / Platform Owner'
            };
            keptMain = true;
          } else {
            deletedAccounts++;
          }
        } else if (isAlexander) {
          deletedAccounts++;
        } else {
          cleaned[key] = acc;
        }
      }
      localStorage.setItem('prime_ai_registered_accounts', JSON.stringify(cleaned));
    }
  } catch (e) {}

  // 4. Ensure master profile in localStorage is intact
  try {
    const profile = {
      uid: 'usr_adnan_master',
      email: 'adnanakhan245@gmail.com',
      displayName: 'Adnan Khan',
      role: 'Master Admin / Platform Owner',
      companyId: 'comp_apex_01',
      companyName: 'Apex Enterprises (HQ)',
      plan: 'Enterprise',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('prime_user_profile', JSON.stringify(profile));
  } catch (e) {}

  return { deletedSessions, deletedAccounts };
}

export async function fetchVisitorAnalytics(): Promise<VisitorTrafficStats> {
  const todayKey = getTodayDateKey();
  let sessions: VisitorSessionRecord[] = [];

  // 1. Try reading from Firestore
  try {
    const colRef = collection(db, 'visitor_sessions');
    const snap = await getDocs(query(colRef, orderBy('lastActiveAt', 'desc'), limit(150)));
    if (!snap.empty) {
      snap.forEach(d => {
        sessions.push(d.data() as VisitorSessionRecord);
      });
    }
  } catch (e) {
    // fallback
  }

  // Merge with local storage
  const rawLocal = getLocalStore<VisitorSessionRecord[]>('all_visitor_sessions', []);
  // Filter out any mock baseline sessions that were previously injected
  const localSessions = rawLocal.filter(s => !s.id.includes('_demo_0') && !s.id.includes('_reg_0'));
  if (localSessions.length !== rawLocal.length) {
    setLocalStore('all_visitor_sessions', localSessions);
  }

  const mergedMap = new Map<string, VisitorSessionRecord>();
  for (const s of sessions) {
    const isMockUser = (s.userEmail && s.userEmail.toLowerCase().includes('apexenterprise.com')) ||
                       (s.userName && s.userName.toLowerCase().includes('alexander')) ||
                       (s.userEmail && s.userEmail.includes('@enterprise.io')) ||
                       (s.userName && s.userName.includes('Enterprise Executive'));
    if (!s.id.includes('_demo_0') && !s.id.includes('_reg_0') && !isMockUser) {
      mergedMap.set(s.id, s);
    }
  }
  for (const s of localSessions) {
    const isMockUser = (s.userEmail && s.userEmail.toLowerCase().includes('apexenterprise.com')) ||
                       (s.userName && s.userName.toLowerCase().includes('alexander')) ||
                       (s.userEmail && s.userEmail.includes('@enterprise.io')) ||
                       (s.userName && s.userName.includes('Enterprise Executive'));
    if (!isMockUser) {
      mergedMap.set(s.id, s);
    }
  }
  sessions = Array.from(mergedMap.values());

  // Calculate stats purely from real traffic
  const nowMs = Date.now();
  const fifteenMinsAgo = nowMs - 15 * 60 * 1000;

  const todaySessions = sessions.filter(s => s.dateKey === todayKey);
  const demoToday = todaySessions.filter(s => s.visitorType === 'DEMO_GUEST' || s.visitorType === 'LANDING_VISITOR');
  const regToday = todaySessions.filter(s => s.visitorType === 'REGISTERED_ACCOUNT');

  const activeNow = sessions.filter(s => {
    const actTime = new Date(s.lastActiveAt).getTime();
    return actTime >= fifteenMinsAgo;
  }).length;

  const convertedCount = todaySessions.filter(s => s.convertedToSignup).length;
  const conversionRate = demoToday.length > 0 ? Math.round((convertedCount / demoToday.length) * 100) : 0;

  const totalDemoAllTime = sessions.filter(s => s.visitorType === 'DEMO_GUEST' || s.visitorType === 'LANDING_VISITOR').length;
  const totalRegAllTime = sessions.filter(s => s.visitorType === 'REGISTERED_ACCOUNT').length;

  // Build 7-day daily trend
  const dailyTrend: Array<{ dateKey: string; formattedDate: string; demoCount: number; registeredCount: number; totalCount: number }> = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const daySessions = sessions.filter(s => s.dateKey === key);
    const dayDemo = daySessions.filter(s => s.visitorType === 'DEMO_GUEST' || s.visitorType === 'LANDING_VISITOR').length;
    const dayReg = daySessions.filter(s => s.visitorType === 'REGISTERED_ACCOUNT').length;

    // Format readable label (e.g. "Today", "Yesterday", or "Tue 15")
    let label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Yesterday';

    dailyTrend.push({
      dateKey: key,
      formattedDate: label,
      demoCount: dayDemo,
      registeredCount: dayReg,
      totalCount: dayDemo + dayReg
    });
  }

  // Sort recent sessions descending
  const recentSessions = [...sessions].sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());

  return {
    totalVisitorsToday: todaySessions.length,
    demoVisitorsToday: demoToday.length,
    registeredUsersToday: regToday.length,
    activeNowCount: Math.max(activeNow, 1),
    conversionRateTodayPct: conversionRate,
    totalVisitorsAllTime: sessions.length,
    totalDemoAllTime,
    totalRegisteredAllTime: totalRegAllTime,
    dailyTrend,
    recentSessions: recentSessions.slice(0, 50)
  };
}





