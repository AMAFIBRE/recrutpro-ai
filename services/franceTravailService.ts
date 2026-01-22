/**
 * France Travail API Service
 * Intégration complète des APIs France Travail pour RecrutPro
 */

// Credentials France Travail
const FRANCE_TRAVAIL_CLIENT_ID = import.meta.env.VITE_FRANCE_TRAVAIL_CLIENT_ID || '';
const FRANCE_TRAVAIL_CLIENT_SECRET = import.meta.env.VITE_FRANCE_TRAVAIL_CLIENT_SECRET || '';

const AUTH_URL = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire';
const API_BASE_URL = 'https://api.francetravail.io/partenaire';

// Cache du token
let cachedToken: { token: string; expiresAt: number } | null = null;

// ==================== AUTHENTIFICATION ====================

/**
 * Récupère un token d'accès OAuth2
 */
export const getAccessToken = async (scopes: string[]): Promise<string> => {
  // Vérifier le cache
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const scopeString = scopes.join(' ');
  
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: FRANCE_TRAVAIL_CLIENT_ID,
      client_secret: FRANCE_TRAVAIL_CLIENT_SECRET,
      scope: scopeString,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur auth France Travail:', errorText);
    throw new Error(`Erreur d'authentification France Travail: ${response.status}`);
  }

  const data = await response.json();
  
  // Mettre en cache
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return data.access_token;
};

// ==================== ROME 4.0 - MÉTIERS & COMPÉTENCES ====================

export interface RomeMetier {
  code: string;
  libelle: string;
  riasecMajeur?: string;
  riasecMineur?: string;
}

export interface RomeCompetence {
  code: string;
  libelle: string;
  type: string;
}

/**
 * Recherche de métiers ROME par mot-clé
 */
export const searchMetiers = async (keyword: string): Promise<RomeMetier[]> => {
  const token = await getAccessToken(['api_rome-metiersv1', 'nomenclatureRome']);
  
  const response = await fetch(
    `${API_BASE_URL}/rome-metiers/v1/metiers?libelle=${encodeURIComponent(keyword)}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error('Erreur recherche métiers:', await response.text());
    return [];
  }

  return response.json();
};

/**
 * Récupère les compétences associées à un code ROME
 */
export const getCompetencesByRome = async (codeRome: string): Promise<RomeCompetence[]> => {
  const token = await getAccessToken(['api_rome-competencesv1', 'nomenclatureRome']);
  
  const response = await fetch(
    `${API_BASE_URL}/rome-competences/v1/competences?codeRome=${codeRome}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error('Erreur compétences:', await response.text());
    return [];
  }

  return response.json();
};

// ==================== LA BONNE BOÎTE ====================

export interface Entreprise {
  siret: string;
  nom: string;
  ville: string;
  codePostal: string;
  nombreEmployes?: number;
  naf?: string;
  distance?: number;
  lat?: number;
  lon?: number;
  contact?: {
    email?: string;
    telephone?: string;
  };
}

/**
 * Recherche d'entreprises qui recrutent (même sans offre publiée)
 */
export const searchEntreprisesQuiRecrutent = async (
  codeRome: string,
  latitude: number,
  longitude: number,
  distance: number = 30
): Promise<Entreprise[]> => {
  const token = await getAccessToken(['api_labonneboitev2']);
  
  const response = await fetch(
    `${API_BASE_URL}/labonneboite/v2/companies?` + new URLSearchParams({
      rome_codes: codeRome,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      distance: distance.toString(),
    }),
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error('Erreur La Bonne Boîte:', await response.text());
    return [];
  }

  const data = await response.json();
  return data.companies || [];
};

// ==================== MARCHÉ DU TRAVAIL ====================

export interface StatsSalaire {
  salaireMin: number;
  salaireMax: number;
  salaireMoyen: number;
  nombreOffres: number;
}

export interface StatsMarche {
  codeRome: string;
  libelleRome: string;
  region: string;
  offres: number;
  demandeurs: number;
  tension: number; // Ratio offres/demandeurs
  salaires?: StatsSalaire;
}

/**
 * Récupère les statistiques du marché du travail pour un métier/région
 */
export const getStatsMarcheEmploi = async (
  codeRome: string,
  codeRegion?: string
): Promise<StatsMarche | null> => {
  const token = await getAccessToken(['api_infotravailv1', 'offresdemploi']);
  
  let url = `${API_BASE_URL}/infotravail/v1/marche?codeRome=${codeRome}`;
  if (codeRegion) {
    url += `&codeRegion=${codeRegion}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Erreur stats marché:', await response.text());
    return null;
  }

  return response.json();
};

// ==================== OFFRES D'EMPLOI ====================

export interface OffreFranceTravail {
  id: string;
  intitule: string;
  description: string;
  dateCreation: string;
  lieuTravail: {
    libelle: string;
    codePostal: string;
    commune: string;
  };
  entreprise: {
    nom: string;
  };
  typeContrat: string;
  salaire?: {
    libelle: string;
  };
  competences?: { libelle: string }[];
  qualitesProfessionnelles?: { libelle: string }[];
}

/**
 * Recherche d'offres d'emploi sur France Travail
 */
export const searchOffres = async (params: {
  motsCles?: string;
  commune?: string;
  codeRome?: string;
  typeContrat?: string;
  range?: string; // "0-9" pour les 10 premières
}): Promise<{ offres: OffreFranceTravail[]; total: number }> => {
  const token = await getAccessToken(['api_offresdemploiv2', 'o2dsoffre']);
  
  const queryParams = new URLSearchParams();
  if (params.motsCles) queryParams.append('motsCles', params.motsCles);
  if (params.commune) queryParams.append('commune', params.commune);
  if (params.codeRome) queryParams.append('codeRome', params.codeRome);
  if (params.typeContrat) queryParams.append('typeContrat', params.typeContrat);
  queryParams.append('range', params.range || '0-14');
  
  const response = await fetch(
    `${API_BASE_URL}/offresdemploi/v2/offres/search?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error('Erreur recherche offres:', await response.text());
    return { offres: [], total: 0 };
  }

  const data = await response.json();
  return {
    offres: data.resultats || [],
    total: data.filtresPossibles?.[0]?.agregation?.[0]?.nbResultats || data.resultats?.length || 0,
  };
};

// ==================== JE CONTRÔLE MON OFFRE (JCMO) - PUBLICATION ====================

export interface OffreAPublier {
  intitule: string;
  description: string;
  codeRome: string;
  lieuTravail: {
    codePostal: string;
    commune: string;
  };
  typeContrat: string; // CDI, CDD, MIS (intérim), etc.
  dureeContrat?: number; // en mois
  experienceExige: string; // D (débutant), S (souhaité), E (exigé)
  salaire?: {
    libelle: string;
    horaire?: number;
    mensuel?: number;
    annuel?: number;
  };
  nombrePostes: number;
  entreprise: {
    nom: string;
    description?: string;
  };
  contact: {
    nom: string;
    email: string;
    telephone?: string;
  };
  competences?: string[];
}

export interface OffrePubliee {
  id: string;
  reference: string;
  urlOffre: string;
  datePublication: string;
  statut: string;
}

/**
 * Publie une offre d'emploi sur France Travail via JCMO
 * Note: Cette API nécessite des droits spécifiques
 */
export const publierOffreFranceTravail = async (offre: OffreAPublier): Promise<OffrePubliee> => {
  const token = await getAccessToken(['api_je-controle-mon-offrev1']);
  
  // Mapper vers le format JCMO
  const offreJCMO = {
    intitule: offre.intitule,
    description: offre.description,
    codeRome: offre.codeRome,
    lieuTravail: offre.lieuTravail,
    typeContrat: mapTypeContrat(offre.typeContrat),
    dureeContratMois: offre.dureeContrat,
    experienceExige: offre.experienceExige,
    salaire: offre.salaire,
    nombrePostes: offre.nombrePostes,
    entreprise: offre.entreprise,
    contact: offre.contact,
    competences: offre.competences?.map(c => ({ libelle: c })),
  };
  
  const response = await fetch(
    `${API_BASE_URL}/je-controle-mon-offre/v1/offres`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(offreJCMO),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur publication JCMO:', errorText);
    throw new Error(`Erreur publication France Travail: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// ==================== ACCÈS DEMANDEURS D'EMPLOI ====================

export interface ProfilDemandeur {
  identifiant: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  codePostal?: string;
  commune?: string;
  dateInscription?: string;
  categorie?: string; // A, B, C, D, E
  metierRecherche?: string;
  codeRome?: string;
  experienceAnnees?: number;
  mobiliteKm?: number;
  disponibilite?: string;
}

/**
 * Recherche de profils demandeurs d'emploi
 * Note: Nécessite des droits partenaire spécifiques
 */
export const searchDemandeursEmploi = async (params: {
  codeRome?: string;
  codePostal?: string;
  distance?: number;
  experience?: string;
}): Promise<ProfilDemandeur[]> => {
  const token = await getAccessToken(['api_acces-emploi-demandeurs-emploiv1']);
  
  const queryParams = new URLSearchParams();
  if (params.codeRome) queryParams.append('codeRome', params.codeRome);
  if (params.codePostal) queryParams.append('codePostal', params.codePostal);
  if (params.distance) queryParams.append('distance', params.distance.toString());
  if (params.experience) queryParams.append('experience', params.experience);
  
  const response = await fetch(
    `${API_BASE_URL}/acces-emploi-demandeurs-emploi/v1/demandeurs?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur recherche demandeurs:', errorText);
    // Cette API peut être restreinte
    if (response.status === 403) {
      throw new Error('Accès refusé: Cette fonctionnalité nécessite un agrément partenaire France Travail.');
    }
    return [];
  }

  const data = await response.json();
  return data.demandeurs || [];
};

// ==================== HELPERS ====================

/**
 * Mapper les types de contrat RecrutPro vers France Travail
 */
const mapTypeContrat = (type: string): string => {
  const mapping: Record<string, string> = {
    'CDI': 'CDI',
    'CDD': 'CDD',
    'Intérim': 'MIS',
    'INTERIM': 'MIS',
    'Freelance': 'LIB',
    'Alternance': 'ALT',
    'Stage': 'STG',
  };
  return mapping[type] || 'CDI';
};

/**
 * Codes des régions françaises
 */
export const REGIONS_FRANCE: Record<string, string> = {
  '01': 'Guadeloupe',
  '02': 'Martinique',
  '03': 'Guyane',
  '04': 'La Réunion',
  '06': 'Mayotte',
  '11': 'Île-de-France',
  '24': 'Centre-Val de Loire',
  '27': 'Bourgogne-Franche-Comté',
  '28': 'Normandie',
  '32': 'Hauts-de-France',
  '44': 'Grand Est',
  '52': 'Pays de la Loire',
  '53': 'Bretagne',
  '75': 'Nouvelle-Aquitaine',
  '76': 'Occitanie',
  '84': 'Auvergne-Rhône-Alpes',
  '93': 'Provence-Alpes-Côte d\'Azur', // Ton territoire !
  '94': 'Corse',
};

/**
 * Coordonnées GPS des principales villes du 06
 */
export const VILLES_06: Record<string, { lat: number; lon: number; cp: string }> = {
  'Nice': { lat: 43.7102, lon: 7.2620, cp: '06000' },
  'Cannes': { lat: 43.5528, lon: 7.0174, cp: '06400' },
  'Antibes': { lat: 43.5808, lon: 7.1239, cp: '06600' },
  'Grasse': { lat: 43.6589, lon: 6.9226, cp: '06130' },
  'Cagnes-sur-Mer': { lat: 43.6645, lon: 7.1482, cp: '06800' },
  'Menton': { lat: 43.7747, lon: 7.5006, cp: '06500' },
  'Vence': { lat: 43.7225, lon: 7.1119, cp: '06140' },
  'Mougins': { lat: 43.6008, lon: 6.9956, cp: '06250' },
};

/**
 * Vérifie si les credentials France Travail sont configurés
 */
export const isFranceTravailConfigured = (): boolean => {
  return !!(FRANCE_TRAVAIL_CLIENT_ID && FRANCE_TRAVAIL_CLIENT_SECRET);
};
