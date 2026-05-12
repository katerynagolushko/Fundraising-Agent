export type InvestorType = 'investor' | 'accelerator';

export type IntroPath = 'warm' | 'cold' | 'apply';

export type InvestorStatus =
  | 'Untouched'
  | 'Contacted'
  | 'Replied'
  | 'Meeting booked'
  | 'Warm'
  | 'Pass'
  | 'Dead';

export type AcceleratorStatus =
  | 'Not applied'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export type Investor = {
  id?: string;
  name: string;
  fund: string;
  type: InvestorType;
  sectors: string[];
  stage: string;
  checkSize: string;
  path: IntroPath;
  mutual: string;
  email: string;
  linkedin: string;
  twitter: string;
  approach: string;
  coldMessage: string;
  signals: string[];
  flag: string;
  applyUrl?: string;
  deadline?: string;
  acceleratorNote?: string;
  status: InvestorStatus | AcceleratorStatus;
  rank: number;
};
