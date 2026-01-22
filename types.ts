export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  INTERIM = 'Intérim',
  FREELANCE = 'Freelance',
  ALTERNANCE = 'Alternance',
  STAGE = 'Stage'
}

export enum Tone {
  PROFESSIONAL = 'Professionnel & Structuré',
  FRIENDLY = 'Amical & Dynamique',
  URGENT = 'Urgent & Direct',
  PRESTIGE = 'Prestigieux & Exclusif',
  STARTUP = 'Startup & Décalé'
}

export interface JobFormData {
  jobTitle: string;
  companyName: string;
  isConfidential: boolean;
  contractType: ContractType;
  location: string;
  remotePolicy: string;
  salary: string;
  experienceLevel: string;
  sector: string;
  description: string;
  skills: string;
  tone: Tone;
  interimBenefits: string[];
  benefits: string[];
  isUrgent?: boolean;
}

export interface GeneratedAd {
  channel: 'LinkedIn' | 'Jobboard' | 'Social';
  title: string;
  content: string;
  hashtags?: string[];
  seoKeywords?: string[];
  base64Image?: string;
}

export interface InterviewQuestion {
  category: 'Technique' | 'Soft Skills' | 'Culture & Motivation';
  question: string;
  linkedTo: string;
  evaluationCriteria: string;
  greenFlags?: string;
  redFlags?: string;
}

// NOUVEAU : Score et analyse de l'annonce
export interface AdAnalysis {
  seoScore: number;
  attractivenessScore: number;
  marketSalary: string;
  competitorComparison: string;
  improvements: string[];
}

export interface GenerationResponse {
  timestamp?: number;
  id?: string;
  ads: GeneratedAd[];
  booleanSearch: string;
  huntingEmail: string;
  interviewQuestions: InterviewQuestion[];
  // NOUVEAU : Fonctionnalités avancées
  analysis?: AdAnalysis;
  smsTemplate?: string;
  voicemailScript?: string;
}
