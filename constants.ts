import { ContractType, Tone } from './types';

export const CONTRACT_OPTIONS = Object.values(ContractType);
export const TONE_OPTIONS = Object.values(Tone);

export const SECTOR_SUGGESTIONS = [
  "BTP / Construction / Gros œuvre",
  "Second œuvre / Finitions",
  "Électricité / Plomberie / CVC",
  "Industrie / Production",
  "Logistique / Manutention",
  "Transport / Chauffeur PL-SPL",
  "Hôtellerie / Restauration",
  "Commerce / Vente / Distribution",
  "Tertiaire / Administratif",
  "Santé / Médico-social",
  "Informatique / Tech",
  "Comptabilité / Finance",
  "Marketing / Communication",
  "Agroalimentaire",
  "Nettoyage / Propreté",
  "Sécurité / Gardiennage"
];

export const EXPERIENCE_OPTIONS = [
  "Débutant accepté (0-1 an)",
  "Junior (1-3 ans)",
  "Confirmé (3-5 ans)",
  "Senior (5-10 ans)",
  "Expert (+10 ans)"
];

export const REMOTE_OPTIONS = [
  "Sur site uniquement",
  "Télétravail partiel (1-2 jours)",
  "Télétravail hybride (3 jours+)",
  "Full Remote",
  "Chantiers / Déplacements",
  "À définir"
];

// Nouveauté : Liste des avantages standards (pour tous contrats)
export const COMMON_BENEFITS = [
  "Tickets Restaurant",
  "Mutuelle prise en charge 100%",
  "Véhicule de fonction",
  "Primes sur objectifs",
  "Participation / Intéressement",
  "Horaires flexibles",
  "Crèche d'entreprise",
  "Salle de sport / Bien-être",
  "13ème mois",
  "RTT",
  "CE avantageux"
];

// Liste des avantages intérim (spécifique)
export const INTERIM_BENEFITS = [
  "+10% IFM (Fin de mission)",
  "+10% CP (Congés Payés)",
  "CET 5% (Compte Épargne Temps)",
  "Acompte de paie à la semaine",
  "Accès FASTT (Logement, Crédit, Mobilité)",
  "Mutuelle Intérimaire",
  "EPI fournis",
  "Prime de panier",
  "Prime de déplacement",
  "Formation professionnelle",
  "Accompagnement personnalisé"
];

// Qualifications courantes (pour auto-complétion)
export const COMMON_CERTIFICATIONS = {
  "BTP / Construction": ["CACES 1-3-5", "CACES Nacelle", "Habilitation Hauteur", "AIPR", "SST"],
  "Électricité": ["Habilitation B1V/B2V/BR/BC", "H0/H1/H2"],
  "Transport": ["Permis C/CE", "FIMO/FCO", "ADR", "Carte conducteur"],
  "Logistique": ["CACES 1A/1B/3/5", "CACES 6", "Gerbeur"],
  "Industrie": ["CACES Pont roulant", "Soudure (TIG/MIG/MAG)", "Électromécanique"],
  "Sécurité": ["CQP APS", "SSIAP 1/2/3", "Carte pro CNAPS"],
  "Santé": ["Diplôme AS/IDE", "AFGSU"],
};

export const INITIAL_FORM_DATA = {
  jobTitle: '',
  companyName: '',
  isConfidential: false,
  contractType: ContractType.CDI,
  location: '',
  remotePolicy: 'À définir',
  salary: '',
  experienceLevel: 'Confirmé (3-5 ans)',
  sector: '',
  description: '',
  skills: '',
  tone: Tone.PROFESSIONAL,
  interimBenefits: ["+10% IFM (Fin de mission)", "+10% CP (Congés Payés)"],
  benefits: [],
  isUrgent: false
};
