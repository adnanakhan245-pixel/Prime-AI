export type PlanTier = 'Starter' | 'Pro' | 'Enterprise' | 'Trial';

export interface Company {
  id: string; // company_id (e.g. comp_...)
  name: string;
  ownerId: string;
  industry?: string;
  targetArr?: number;
  plan: PlanTier;
  mrr: number; // e.g. 0, 499, 999, 2999
  status: 'active' | 'trialing' | 'expired' | 'canceled';
  createdAt: string;
  updatedAt?: string;
}

export interface UserSubscription {
  id?: string;
  companyId: string;
  userId: string;
  status: 'trialing' | 'active' | 'expired' | 'canceled' | 'past_due';
  trialStartDate?: string; // ISO date string (when 14-day free trial started)
  trialEndDate?: string; // ISO date string (14 days from signup)
  trialEndsAt: string; // ISO date string alias for trialEndDate
  trial_start_date?: string; // Supabase column mapping
  trial_end_date?: string; // Supabase column mapping
  expiresAt?: string; // 1-month exact validity expiration timestamp (ISO date string)
  aiActionsRemaining: number; // 50 actions for trial, unlimited for paid
  plan: PlanTier | string; // 'Starter ($499/mo)' | 'Pro ($999/mo)' | 'Enterprise ($2,999/mo)' | 'Trial'
  planTier?: PlanTier;
  planPrice?: number; // 499, 999, 2999
  paymentMethod?: 'PAYONEER' | 'STRIPE' | 'CARD' | 'PADDLE' | 'LEMON_SQUEEZY';
  transactionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  companyId: string;
  companyName: string;
  role: 'CEO' | 'admin' | 'owner' | 'executive' | string;
  plan: PlanTier;
  emailVerified?: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription?: UserSubscription;
  createdAt: string;
  updatedAt?: string;
  stats?: {
    emailsHandled: number;
    docsAnalyzed: number;
    hoursSaved: number;
  };
}

export interface EmailItem {
  id: string;
  companyId: string;
  userId: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  fullBody: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CLIENT' | 'VENDOR' | 'INVESTOR' | 'TEAM' | 'LEGAL';
  receivedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'IGNORED' | 'SENT';
  aiDraftReply?: string;
  aiKeyTakeaway?: string;
  aiSuggestedAction?: string;
  approvedAt?: string;
}

export interface DocumentItem {
  id: string;
  companyId?: string;
  userId: string;
  title: string;
  fileType: string;
  fileSize: number;
  content: string;
  uploadedAt: string;
  summary: string;
  keyPoints: string[];
  risks: string[];
  nextActions: string[];
  category: 'FINANCIAL' | 'LEGAL' | 'OPERATIONS' | 'HR' | 'STRATEGY' | 'OTHER';
}

export interface ChatMessage {
  id: string;
  companyId?: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: string[];
  sources?: Array<{ title: string; uri: string }>;
  mode?: string;
  playAction?: {
    id: string;
    type: 'DISPATCH_EMAIL' | 'APPROVE_INBOX' | 'SAVE_DIRECTIVE' | 'CUSTOM_EXECUTE';
    label: string;
    threat: string;
    opportunity: string;
    play: string;
    payload?: any;
    executed?: boolean;
  };
}

export interface ActivityItem {
  id: string;
  companyId?: string;
  userId: string;
  type: 'EMAIL_APPROVED' | 'EMAIL_TRIAGED' | 'DOC_ANALYZED' | 'BRAIN_CONSULT' | 'SETTINGS_UPDATED' | 'RADAR_ACTION_TRIGGERED' | 'CRM_SYNCED' | 'COMPANY_CREATED' | 'DEALS_IMPORTED' | 'PLAN_UPGRADED' | 'DEAL_UPDATED' | 'DEAL_CREATED' | 'DEAL_WON' | 'CAMPAIGN_AUDITED' | 'INVOICE_CREATED' | 'PAYMENT_RECOVERED';
  title: string;
  description: string;
  timestamp: string;
  iconName?: string;
}

export interface ChurnRescuePlaybook {
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  riskCategory: 'INACTIVITY' | 'SLA_FRICTION' | 'BUDGET_REVIEW' | 'LEADERSHIP_CHANGE' | 'FEATURE_GAP';
  churnProbability: number; // 0 - 100%
  headline: string;
  rescueStrategy: string;
  proposedConcession: string;
  rescueEmailSubject: string;
  rescueEmailBody: string;
  ceoDirectMessage?: string;
  actionSteps: string[];
  savedArr: number;
  generatedAt: string;
}

export interface ExpansionPlaybook {
  recommendedTier: string;
  currentMrr: number;
  targetMrr: number;
  expansionArrUplift: number;
  roiSummary: string;
  pitchAngle: string;
  proposalEmailSubject: string;
  proposalEmailBody: string;
  businessCaseDeckPoints: string[];
  closingIncentive: string;
  generatedAt: string;
}

export interface DunningRecoveryItem {
  id: string;
  companyId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  failedAmount: number; // USD
  currency: string;
  failedDate: string;
  retryAttempts: number;
  status: 'PENDING' | 'RECOVERED' | 'UNCOLLECTIBLE';
  recoveryEmailSubject?: string;
  recoveryEmailBody?: string;
  paymentUpdateUrl?: string;
  recoveredAt?: string;
}

export interface InAppEvent {
  id: string;
  eventName: string; // e.g. 'report_exported', 'api_key_created', 'team_member_invited', 'quota_exceeded'
  timestamp: string;
  count?: number;
  metadata?: Record<string, any>;
}

export interface PQLSignal {
  id: string;
  companyId: string;
  accountId: string;
  accountName: string;
  userEmail: string;
  userName: string;
  currentPlan: 'Free Trial' | 'Starter' | 'Pro' | 'Enterprise';
  targetPlan: 'Pro' | 'Enterprise';
  pqlScore: number; // 0 - 100
  pqlTriggerReason: string; // e.g., 'Exported 12 reports in 2 hours', 'Invited 5 team members in 24h', 'Hit 95% API Limit'
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
  estimatedArrUplift: number;
  recentEvents: InAppEvent[];
  onboardingProgress: number; // 0 - 100%
  stuckStep?: string; // e.g. 'Stripe Webhook Verification', 'SSO Config'
  sentimentScore: number; // NPS estimate -100 to +100
  sentimentLabel: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';
  aiConversionPitch?: {
    subject: string;
    body: string;
    talkingPoints: string[];
    suggestedOffer: string;
    generatedAt: string;
  };
  status: 'NEW_OPPORTUNITY' | 'PITCHED' | 'CONVERTED' | 'DISMISSED';
  detectedAt: string;
}

export interface CompetitorThreat {
  competitorName: string; // e.g. "Gong.io", "Salesloft", "HubSpot Enterprise", "Retool"
  perceivedAdvantage: string; // e.g. "Offering 30% aggressive buyout discount + free onboarding"
  criticalWeaknesses: string[]; // e.g. ["Lacks real-time AI auto-rescue", "No native Supabase/Stripe live writeback", "Mandates $15k professional services fee"]
  estimatedPriceGap: number; // e.g. -$12,000 / yr
}

export interface RenewalDefenseItem {
  id: string;
  companyId: string;
  accountId: string;
  accountName: string;
  decisionMakerName: string;
  decisionMakerEmail: string;
  decisionMakerRole: string; // e.g. "Chief Revenue Officer", "VP Engineering"
  contractArr: number; // e.g. $48,000 / yr
  contractRenewalDate: string; // ISO date, e.g. in 45 days
  daysUntilRenewal: number; // e.g. 42
  historicalRoiDollarsSaved: number; // e.g. $215,000
  historicalHoursSaved: number; // e.g. 640 hrs
  competitorThreat?: CompetitorThreat;
  renewalHealthScore: number; // 0 - 100
  status: 'PENDING_PREEMPTION' | 'DEFENSE_DEPLOYED' | 'MULTI_YEAR_LOCKED' | 'AUTO_RENEWED';
  lockInTermYears?: number; // 2 or 3 years
  multiYearArrTotal?: number;
  aiDefenseStrategy?: {
    roiExecutiveSummary: string;
    competitorCounterStrike: string;
    battleCardTalkingPoints: string[];
    multiYearOfferProposal: string;
    executiveOutreachSubject: string;
    executiveOutreachBody: string;
    generatedAt: string;
  };
  detectedAt: string;
}

export interface RenewalDefenseStats {
  upcomingRenewalsCount: number;
  totalRenewalArrAtStake: number;
  competitorAttackedArr: number;
  multiYearLockedArr: number;
  avgRenewalHealth: number;
  projectedNrrImpact: number; // e.g. +18.4%
}

export interface PLGTelemetryStats {
  totalActiveUsersToday: number;
  totalPQLs: number;
  totalPqlOpportunities: number;
  potentialArr: number;
  pqlPipelineValue: number;
  convertedArr: number;
  avgPQLScore: number;
  avgOnboardingCompletion: number;
  featureAdoptionRate: number; // %
  npsScore: number;
  topActivatedFeature: string;
  topDropoffStep: string;
}

export interface SaaSTelemetryStats {
  mrr: number;
  arr: number;
  nrr: number; // Net Revenue Retention %
  churnRate: number; // %
  arpu: number; // Average Revenue Per User
  ltv: number; // Lifetime Value
  totalActiveSubscribers: number;
  totalAtRiskArr: number;
  totalExpansionArr: number;
  totalFailedPaymentArr: number;
}

export interface CRMRecord {
  id: string;
  companyId: string;
  userId: string;
  accountName: string;
  contactName: string;
  contactEmail: string;
  contactRole?: string;
  dealValue: number; // In USD, e.g. 15000, 45000
  stage: 'Discovery' | 'Proposal' | 'Negotiation' | 'Contract Sent' | 'Active Client' | 'Churn Risk' | 'Closed Won' | 'Closed Lost';
  type: 'CLIENT' | 'LEAD';
  lastContactDate: string; // ISO date string
  daysSinceLastContact: number;
  healthScore: number; // 0 - 100
  riskFactors: string[];
  notes?: string;
  source: 'Supabase' | 'CRM Sync' | 'Direct Entry';
  // SaaS Specific Telemetry Fields
  mrr?: number;
  planTier?: 'Starter' | 'Pro' | 'Enterprise' | 'Custom';
  seatsUsed?: number;
  seatsTotal?: number;
  activityDropPct?: number; // e.g. -45%
  churnProbability?: number; // 0 - 100%
  expansionPotentialArr?: number;
  stripeStatus?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'trialing';
  failedPaymentAmount?: number;
  churnRescuePlaybook?: ChurnRescuePlaybook;
  expansionPlaybook?: ExpansionPlaybook;
  aiAction?: {
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    headline: string;
    strategy: string;
    tactics: string[];
    emailSubject: string;
    emailBody: string;
    winProbability: number;
    generatedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RevenueRadarStats {
  atRiskCount: number;
  atRiskPipelineValue: number;
  hotLeadsCount: number;
  hotLeadsPipelineValue: number;
  totalPipelineValue: number;
  totalAccountsCount: number;
}

export interface KPISummary {
  emailsHandled: number;
  docsAnalyzed: number;
  hoursSaved: number;
  pendingEmailsCount: number;
  pendingEmails?: number;
  totalDocsCount: number;
}

// Closer AI Types (Saved to Supabase 'calls')
export interface CallFeedback {
  score: number; // 0 - 100
  transcript: string;
  whatWentWrong: string[];
  whatWentRight: string[];
  betterScript: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL';
  objectionHandlingScore?: number;
  closeProbability?: number;
}

export interface CallRecord {
  id: string;
  userId: string;
  filename: string;
  fileSize?: number;
  durationSeconds?: number;
  score: number; // 0 - 100
  transcript: string;
  feedback_wrong: string[];
  feedback_right: string[];
  better_script: string;
  createdAt: string;
  syncedToSupabase?: boolean;
}

// Hiring AI Types (Saved to Supabase 'candidates')
export interface RankedCandidate {
  id: string;
  name: string;
  match_score: number; // 0 - 100
  currentRole: string;
  yearsExperience: string;
  fitSummary: string;
  keyStrengths: string[];
  riskOrGaps?: string[];
  recommendedDecision: 'STRONG_HIRE' | 'HIRE' | 'CONSIDER' | 'PASS';
}

export interface HiringAnalysis {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  totalCVsAnalyzed: number;
  topCandidates: RankedCandidate[];
  interviewQuestions: string[];
  idealCandidateTraits?: string[];
  createdAt: string;
  syncedToSupabase?: boolean;
}

// Meeting AI Types (Saved to Supabase 'meetings')
export interface MeetingActionItem {
  owner: string;
  task: string;
  completed?: boolean;
  dueDate?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MeetingDraftEmail {
  subject: string;
  body: string;
  recipients?: string[];
}

export interface MeetingAnalysisResult {
  summary: string;
  action_items: MeetingActionItem[];
  draft_followup_email: MeetingDraftEmail;
  transcript?: string;
  keyDecisions?: string[];
  participants?: string[];
}

export interface MeetingRecord {
  id: string;
  userId: string;
  title: string;
  summary: string;
  action_items: MeetingActionItem[];
  draft_followup_email: MeetingDraftEmail;
  transcript?: string;
  filename?: string;
  fileSize?: number;
  durationSeconds?: number;
  emailSent?: boolean;
  createdAt: string;
  syncedToSupabase?: boolean;
}

// Growth Lab Types (Saved to Supabase 'growth_audits')
export interface GrowthLever {
  title: string;
  category?: string;
  impact: string;
  description: string;
  implementationSteps?: string[];
  estimatedARRBoost?: string;
}

export interface GrowthActionPlanItem {
  day: string; // e.g. "Week 1: Days 1-7" or "Day 1-5"
  task: string;
  owner?: string;
  expectedOutcome?: string;
  completed?: boolean;
}

export interface GrowthAuditResult {
  growth_score: number; // 0 - 100
  top_3_levers: GrowthLever[];
  action_plan_30_day: GrowthActionPlanItem[];
  company_name?: string;
  domain?: string;
  summary?: string;
}

export interface GrowthAuditRecord {
  id: string;
  userId: string;
  url: string;
  company_name: string;
  growth_score: number;
  top_3_levers: GrowthLever[];
  action_plan_30_day: GrowthActionPlanItem[];
  summary?: string;
  createdAt: string;
  syncedToSupabase?: boolean;
}

// Strategy Board Types (Saved to Supabase 'strategies')
export interface StrategyRisk {
  title: string;
  category: 'REVENUE' | 'CHURN' | 'PIPELINE' | 'EXECUTION' | 'COMPLIANCE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  mitigationPlan: string;
  impactScore?: number;
}

export interface StrategyOpportunity {
  title: string;
  category: 'UPSELL' | 'NEW_LOGOS' | 'PRODUCT_EXPANSION' | 'CONVERSION' | 'PARTNERSHIP';
  potentialARR: string;
  description: string;
  actionRequired: string;
  confidenceScore?: number;
}

export interface StrategyGoal {
  id?: string;
  targetMetric: string;
  currentBaseline: string;
  deadline: string;
  description: string;
  status?: 'ON_TRACK' | 'AT_RISK' | 'PLANNED';
  keyResults: string[];
}

export interface StrategyTeamAssignment {
  roleOrLeader: string;
  focusArea: string;
  keyDeliverables: string[];
  allocatedBudgetOrFTE?: string;
  priority: 'P0' | 'P1' | 'P2';
}

export interface StrategyMilestoneItem {
  timeframe: string;
  milestoneTitle: string;
  actions: string[];
  expectedKpiImpact: string;
  owner: string;
  completed?: boolean;
}

export interface StrategyPlan {
  executive_summary: string;
  top_3_risks: StrategyRisk[];
  top_3_opportunities: StrategyOpportunity[];
  q4_goals: StrategyGoal[];
  team_assignments: StrategyTeamAssignment[];
  plan_90_day?: StrategyMilestoneItem[];
  strategic_health_score?: number;
  pipeline_health_rating?: string;
  projected_arr_impact?: string;
  execution_readiness_score?: number;
}

export interface StrategyRecord {
  id: string;
  userId: string;
  companyName: string;
  dateRange: string;
  strategy: StrategyPlan;
  createdAt: string;
  syncedToSupabase?: boolean;
}

// Board Pack & Investor Deck Types (Saved to Supabase 'board_packs')
export interface BoardFinancialMetric {
  label: string;
  value: string;
  change: string;
  status: 'POSITIVE' | 'NEUTRAL' | 'ATTENTION';
  subtext: string;
}

export interface BoardResolution {
  id: string;
  title: string;
  description: string;
  status: 'APPROVED' | 'PENDING_VOTE' | 'TABLED';
  sponsoredBy: string;
  voteCount?: { for: number; against: number; abstain: number };
}

export interface BoardPackData {
  meetingTitle: string;
  quarter: string;
  executiveSummary: string;
  ceoMessage: string;
  financialMetrics: BoardFinancialMetric[];
  keyHighlights: string[];
  topRisks: Array<{ risk: string; severity: string; mitigation: string }>;
  resolutions: BoardResolution[];
  strategicPrioritiesNextQuarter: string[];
  boardDeckSlidesCount?: number;
}

export interface BoardPackRecord {
  id: string;
  companyId?: string;
  userId: string;
  companyName: string;
  quarter: string;
  boardPack: BoardPackData;
  createdAt: string;
  syncedToSupabase?: boolean;
}

export interface BriefingRecord {
  id: string;
  companyId: string;
  userId: string;
  date: string;
  headline: string;
  arrForecast: number;
  churnRiskArr: number;
  pendingActionsCount: number;
  topPriorities: string[];
  operationalMetrics: {
    emailsPending: number;
    dealsInFlight: number;
    hoursSaved: number;
  };
  generatedAt: string;
}

// Multi-Tenant Admin Console Data
export interface CompanySummary {
  id: string;
  name: string;
  ownerEmail: string;
  ownerName?: string;
  plan: PlanTier;
  mrr: number;
  userCount: number;
  dealsCount: number;
  dealCount?: number;
  pipelineValue: number;
  status: 'active' | 'trialing' | 'expired' | 'canceled';
  createdAt: string;
  industry: string;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  companyId: string;
  companyName: string;
  plan: PlanTier;
  createdAt: string;
  lastActive?: string;
  status: 'active' | 'trialing' | 'invited' | 'offline';
  isSuperAdmin?: boolean;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalMRR: number;
  totalCompanies: number;
  totalPipelineARR: number;
  totalPipelineValue?: number;
  totalDeals?: number;
  activeTrialsCount: number;
  paidCompaniesCount: number;
  companies: CompanySummary[];
  users: AdminUserRecord[];
  visitorStats?: VisitorTrafficStats;
}

export type VisitorType = 'DEMO_GUEST' | 'REGISTERED_ACCOUNT' | 'LANDING_VISITOR';

export interface VisitorSessionRecord {
  id: string;
  visitorType: VisitorType;
  userId?: string;
  userEmail?: string;
  userName?: string;
  companyId?: string;
  companyName?: string;
  entryPath: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  referrer: string;
  timestamp: string; // ISO string
  dateKey: string; // YYYY-MM-DD
  actionsCount: number;
  lastActiveAt: string;
  convertedToSignup?: boolean;
}

export interface VisitorTrafficStats {
  totalVisitorsToday: number;
  demoVisitorsToday: number;
  registeredUsersToday: number;
  activeNowCount: number;
  conversionRateTodayPct: number;
  totalVisitorsAllTime: number;
  totalDemoAllTime: number;
  totalRegisteredAllTime: number;
  dailyTrend: Array<{
    dateKey: string;
    formattedDate: string;
    demoCount: number;
    registeredCount: number;
    totalCount: number;
  }>;
  recentSessions: VisitorSessionRecord[];
}

// =========================================================================
// CEO DIGITAL TWIN & NEURAL PERSONA MATRIX TYPES
// =========================================================================
export type CEOVoiceArchetype = 
  | 'HIGH_VELOCITY_CLOSER'
  | 'DIPLOMATIC_FOUNDER'
  | 'RUTHLESS_OPERATOR'
  | 'STRATEGIC_VISIONARY'
  | 'CUSTOM_SYNTHESIS';

export interface CEOToneMatrix {
  brevity: number; // 1 (Detailed briefs) - 10 (One-sentence sharp directives)
  assertiveness: number; // 1 (Guarded diplomatic) - 10 (High conviction & bold)
  candor: number; // 1 (Polite corporate diplomacy) - 10 (Radical direct candor)
  urgency: number; // 1 (Measured pace) - 10 (Immediate 24-hr hard deadline)
  optimism: number; // 1 (Cautious realist) - 10 (High-energy vision booster)
}

export interface CEODecisionHeuristics {
  autoApproveBudgetBelow: number; // e.g. $10,000
  contractDiscountLimitPct: number; // e.g. 15%
  escalateLegalPhrases: string[];
  escalateClientTiers: string[];
  defaultMeetingDurationMins: number; // 15 or 30
  standoffResponseStrategy: 'FIRM_DEFENSE' | 'VALUE_REALIGN' | 'EXECUTIVE_COMPROMISE';
}

export interface CEODigitalTwinConfig {
  id: string;
  companyId: string;
  userId: string;
  ceoName: string;
  ceoTitle: string;
  archetype: CEOVoiceArchetype;
  matrix: CEOToneMatrix;
  signatureHook: string; // e.g. "Team," or "Let's be direct:"
  signatureSignoff: string; // e.g. "- Alexander Vance, CEO" or "Onward,"
  powerPhrases: string[]; // e.g. ["Move with extreme speed", "Revenue is vanity, cash flow is sanity"]
  bannedPhrases: string[]; // e.g. ["just checking in", "per my last email", "synergies", "circling back"]
  sampleWritings: string[]; // Historical writing samples used for neural calibration
  heuristics: CEODecisionHeuristics;
  voiceStyleSummary?: string;
  lastCalibratedAt?: string;
  activeStatus: 'ONLINE_ACTIVE' | 'SUPERVISED_AUTONOMOUS' | 'OFFLINE_TRAINING';
}

export interface DigitalTwinSimulationResult {
  scenarioTitle: string;
  inputRawThought: string;
  archetypeUsed: string;
  synthesizedOutput: string;
  voiceAlignmentScore: number; // 0-100%
  executiveHeuristicsApplied: string[];
  keyToneMarkers: {
    brevityRating: string;
    assertivenessRating: string;
    signaturePhrasesIncluded: string[];
  };
  alternativeAngles: {
    diplomaticAngle: string;
    aggressiveCloserAngle: string;
  };
  generatedAt: string;
}

// =========================================================================
// 1. MARKETING & AD SPEND / CAC OPTIMIZER TYPES
// =========================================================================
export type AdPlatformType = 
  | 'Google Ads' 
  | 'Meta (Facebook & IG)' 
  | 'LinkedIn Ads' 
  | 'TikTok Ads' 
  | 'YouTube Video' 
  | 'Twitter / X' 
  | 'Affiliate / Organic'
  | 'Other';

export interface AdCampaignItem {
  id: string;
  companyId: string;
  userId: string;
  campaignName: string;
  platform: AdPlatformType;
  monthlyBudget: number; // in USD or local currency
  actualSpend: number;
  leadsGenerated: number;
  customersAcquired: number;
  revenueGenerated: number;
  targetCac: number; // Max allowable CAC
  calculatedCac: number; // actualSpend / max(customersAcquired, 1)
  roas: number; // revenueGenerated / max(actualSpend, 1)
  status: 'ACTIVE' | 'PAUSED' | 'OPTIMIZED' | 'FLAGGED_WASTE';
  wasteRiskMonthly: number; // estimated monthly waste or burn amount
  efficiencyGrade: 'A+' | 'B' | 'C' | 'D' | 'F_CRITICAL';
  auditNotes: string;
  aiSuggestedAction: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdSpendAuditSummary {
  totalMonthlyBudget: number;
  totalActualSpend: number;
  totalRevenueGenerated: number;
  totalCustomersAcquired: number;
  blendedCac: number;
  blendedRoas: number;
  totalMonthlyWasteIdentified: number;
  projectedAnnualSavings: number;
  flaggedCampaignsCount: number;
  topPerformingPlatform: string;
}

// =========================================================================
// 4. OVERDUE INVOICES & CASH FLOW GUARD TYPES
// =========================================================================
export type InvoiceStatus = 'PAID' | 'UNPAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'DISPUTED';

export type PaymentGatewayType = 
  | 'Stripe (2.9% + $0.30)' 
  | 'PayPal (3.49% + $0.49)' 
  | 'Wise / ACH Bank Transfer (0.4% Cap $5)' 
  | 'Payoneer (1.5% - 2%)' 
  | 'Direct Wire / Swift (Fixed $15 - $25)' 
  | 'Local Bank Transfer (0%)';

export interface InvoiceItem {
  id: string;
  companyId: string;
  userId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  amount: number;
  currency: string; // USD, PKR, EUR, GBP, AED
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  daysOverdue: number;
  paidAmount?: number;
  paidDate?: string;
  selectedGateway: PaymentGatewayType;
  currentGatewayFee: number; // Estimated fee based on selected gateway
  recommendedGateway: PaymentGatewayType;
  optimizedGatewayFee: number;
  feeSavingsAmount: number; // currentGatewayFee - optimizedGatewayFee
  reminderCount: number;
  lastReminderSentAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CashFlowGuardStats {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdueAmount: number;
  overdueCount: number;
  unpaidCount: number;
  paidCount: number;
  totalGatewayFeesBleed: number;
  potentialGatewayFeeSavings: number;
  avgPaymentCollectionDays: number;
}

export type FeedbackType = 'BUG' | 'FEATURE_REQUEST' | 'IMPROVEMENT' | 'COMPLAINT' | 'BILLING';
export type FeedbackPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FeedbackStatus = 'PENDING' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'PLANNED_FOR_NEXT_RELEASE' | 'RESOLVED' | 'DECLINED';

export interface FeedbackTicket {
  id: string;
  companyId: string;
  companyName: string;
  userId: string;
  userEmail: string;
  userName?: string;
  type: FeedbackType;
  title: string;
  description: string;
  category: string; // e.g., 'Ad Spend Optimizer', 'Cash Flow Guard', 'Documents Intel', 'Executive Inbox', 'CEO Digital Twin', 'Billing & Plans', 'Mobile App', 'White-Label', 'General UI'
  priority: FeedbackPriority;
  status: FeedbackStatus;
  adminReply?: string;
  targetReleaseVersion?: string; // e.g., 'v2.4.0', 'Upcoming Sprint'
  upvotes: number;
  upvotedBy?: string[]; // user IDs
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface ChangelogItem {
  version: string;
  releaseDate: string;
  title: string;
  description: string;
  tag: 'MAJOR' | 'FEATURE' | 'IMPROVEMENT' | 'BUG_FIX';
  requestedByCompany?: string;
  changes: string[];
}

export interface VisitorRecord {
  id: string;
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  hits: number;
  device: 'Mobile' | 'Tablet' | 'Desktop';
  referrer: string;
  timezone: string;
  language: string;
  isRegistered: boolean;
  userEmail?: string | null;
  userName?: string | null;
  companyName?: string | null;
  lastPath: string;
}

export interface LeadRecord {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  industry?: string;
  plan: string;
  signedUpAt: string;
  device: string;
  referrer: string;
}

export interface AnalyticsStats {
  totalHits: number;
  uniqueVisitors: number;
  totalSignups: number;
  activeNow: number;
  lastUpdated: string;
  recentVisitors: VisitorRecord[];
  leads: LeadRecord[];
}




