import { CEODigitalTwinConfig, DigitalTwinSimulationResult, CEOVoiceArchetype } from '../types';

const TWIN_STORAGE_KEY = 'prime_ai_ceo_digital_twin_';

export const DEFAULT_TWIN_CONFIG: CEODigitalTwinConfig = {
  id: 'twin_default_01',
  companyId: 'comp_apex_01',
  userId: 'user_ceo_01',
  ceoName: 'Alexander Vance',
  ceoTitle: 'Chief Executive Officer & Founder',
  archetype: 'HIGH_VELOCITY_CLOSER',
  matrix: {
    brevity: 8,
    assertiveness: 9,
    candor: 8,
    urgency: 9,
    optimism: 7,
  },
  signatureHook: 'Team,',
  signatureSignoff: '- Alexander Vance, CEO',
  powerPhrases: [
    'Move with extreme speed',
    'Revenue is vanity, cash flow is sanity',
    'Default to high-velocity action',
    'Eliminate low-leverage friction',
    'We play to win, not to avoid losing'
  ],
  bannedPhrases: [
    'just checking in',
    'per my last email',
    'synergies',
    'circling back',
    'hoping to touch base',
    'sorry for the delay'
  ],
  sampleWritings: [
    'Team, we are 18 days away from closing Q3. Our $1.8M ARR pipeline target is non-negotiable. I need every account executive running daily pipeline reviews with engineering leads present. Zero excuses on SLA delays. - Vance',
    'Hi Sarah, I reviewed the revised agreement with CloudScale. A 20% discount is off the table unless they commit to a 3-year upfront cash term with zero termination for convenience. If they push back, walk away. We have two competing enterprise deals in queue. - Vance'
  ],
  heuristics: {
    autoApproveBudgetBelow: 15000,
    contractDiscountLimitPct: 12,
    escalateLegalPhrases: ['indemnification clause', 'liquidated damages', 'governing law dispute'],
    escalateClientTiers: ['Tier-1 Enterprise (> $100k ARR)'],
    defaultMeetingDurationMins: 15,
    standoffResponseStrategy: 'FIRM_DEFENSE',
  },
  voiceStyleSummary: 'Ultra-decisive, high-conviction executive tone with razor-sharp brevity and uncompromising accountability.',
  lastCalibratedAt: new Date().toISOString(),
  activeStatus: 'ONLINE_ACTIVE',
};

export const PRESET_SCENARIOS = [
  {
    id: 'push_back_contract_delay',
    title: 'Enterprise Client Dragging Contract Finalization',
    category: 'Sales & Closing',
    rawThought: 'Tell the enterprise buyer at GlobalCorp that their procurement team has delayed the $180k ARR contract for 3 weeks. If they do not execute by Friday 5 PM, their dedicated compute slot will be reassigned to another enterprise customer on our waitlist.'
  },
  {
    id: 'turn_down_board_hire',
    title: 'Board Member Recommending Unqualified Executive',
    category: 'Governance & Board',
    rawThought: 'Politely but firmly tell our lead investor that their recommended VP of Marketing candidate lacks enterprise B2B track record. We are proceeding with our vetted finalist who scaled ARR from $2M to $25M.'
  },
  {
    id: 'all_hands_urgency',
    title: 'Q4 Revenue Sprint All-Hands Memo',
    category: 'Internal Leadership',
    rawThought: 'Send a memo to the entire 60-person team: We are entering the final 45 days of the fiscal year. Cancel non-critical meetings, double down on customer onboarding velocity, and reward the top 3 closers with company stock options.'
  },
  {
    id: 'vendor_price_hike_rejection',
    title: 'Rejecting Crucial Software Vendor 30% Price Hike',
    category: 'Operations & Finance',
    rawThought: 'Inform our database vendor account rep that their proposed 30% price increase is completely unacceptable. Remind them our contract grandfather clause protects our rate for 18 more months, and we are ready to benchmark against PostgreSQL migration.'
  }
];

export function getDigitalTwinConfig(companyId: string, userId: string, ceoName?: string): CEODigitalTwinConfig {
  const key = `${TWIN_STORAGE_KEY}${companyId}_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored twin config:', e);
    }
  }

  return {
    ...DEFAULT_TWIN_CONFIG,
    companyId: companyId || 'comp_apex_01',
    userId: userId || 'user_ceo_01',
    ceoName: ceoName || DEFAULT_TWIN_CONFIG.ceoName,
    signatureSignoff: ceoName ? `- ${ceoName}, CEO` : DEFAULT_TWIN_CONFIG.signatureSignoff,
  };
}

export function saveDigitalTwinConfig(config: CEODigitalTwinConfig): void {
  const key = `${TWIN_STORAGE_KEY}${config.companyId}_${config.userId}`;
  localStorage.setItem(key, JSON.stringify(config));
}

export async function synthesizeTwinCommunication(
  config: CEODigitalTwinConfig,
  inputRawThought: string,
  scenarioTitle?: string,
  companyName?: string
): Promise<DigitalTwinSimulationResult> {
  const res = await fetch('/api/gemini/ceo-digital-twin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenarioTitle: scenarioTitle || 'Executive Directive',
      inputRawThought,
      ceoName: config.ceoName,
      ceoTitle: config.ceoTitle,
      companyName: companyName || 'Apex Enterprises',
      archetype: config.archetype,
      matrix: config.matrix,
      signatureHook: config.signatureHook,
      signatureSignoff: config.signatureSignoff,
      powerPhrases: config.powerPhrases,
      bannedPhrases: config.bannedPhrases,
      heuristics: config.heuristics,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to synthesize CEO Twin output: ${res.statusText}`);
  }

  return await res.json();
}

export async function analyzeCEOStyleFromSample(
  sampleText: string,
  ceoName: string,
  currentRole: string
): Promise<{
  detectedArchetype: CEOVoiceArchetype;
  calibratedMatrix: {
    brevity: number;
    assertiveness: number;
    candor: number;
    urgency: number;
    optimism: number;
  };
  extractedSignatureHook: string;
  extractedSignatureSignoff: string;
  extractedPowerPhrases: string[];
  recommendedBannedPhrases: string[];
  linguisticProfileSummary: string;
  readingGradeLevel: string;
  confidenceScore: number;
}> {
  const res = await fetch('/api/gemini/analyze-ceo-style', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sampleText,
      ceoName,
      currentRole,
    }),
  });

  if (!res.ok) {
    throw new Error(`Style calibration failed: ${res.statusText}`);
  }

  return await res.json();
}
