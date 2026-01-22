/**
 * France Travail API Service
 * Utilise un proxy serverless pour éviter les problèmes CORS
 */

const API_PROXY_URL = '/api/france-travail';

// ==================== TYPES ====================

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

export interface Entreprise {
  siret: string;
  nom: string;
  name?: string;
  ville: string;
  city?: string;
  codePostal: string;
  zipcode?: string;
  nombreEmployes?: number;
  headcount_text?: string;
  naf?: string;
  distance?: number;
  lat?: number;
  lon?: number;
  contact?: {
    email?: string;
    telephone?: string;
  };
}

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
  tension: number;
  salaires?: StatsSalaire;
}

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
}

export interface ProfilDemandeur {
  identifiant: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  codePostal?: string;
  commune?: string;
  metierRecherche?: string;
  codeRome?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Recherche de métiers ROME par mot-clé
 */
export const searchMetiers = async (keyword: string): Promise<RomeMetier[]> => {
  try {
    const response = await fetch(`${API_PROXY_URL}?endpoint=metiers&keyword=${encodeURIComponent(keyword)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur recherche métiers:', errorData);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur searchMetiers:', error);
    return [];
  }
};

/**
 * Récupère les compétences associées à un code ROME
 */
export const getCompetencesByRome = async (codeRome: string): Promise<RomeCompetence[]> => {
  try {
    const response = await fetch(`${API_PROXY_URL}?endpoint=competences&codeRome=${codeRome}`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur getCompetencesByRome:', error);
    return [];
  }
};

/**
 * Recherche d'entreprises qui recrutent (La Bonne Boîte)
 */
export const searchEntreprisesQuiRecrutent = async (
  codeRome: string,
  latitude: number,
  longitude: number,
  distance: number = 30
): Promise<Entreprise[]> => {
  try {
    const params = new URLSearchParams({
      endpoint: 'labonneboite',
      codeRome,
      lat: latitude.toString(),
      lon: longitude.toString(),
      distance: distance.toString(),
    });

    const response = await fetch(`${API_PROXY_URL}?${params}`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    // L'API retourne { companies: [...] }
    const companies = data.companies || data || [];
    
    // Normaliser les données
    return companies.map((c: any) => ({
      siret: c.siret,
      nom: c.name || c.nom,
      ville: c.city || c.ville,
      codePostal: c.zipcode || c.codePostal,
      distance: c.distance,
      headcount_text: c.headcount_text,
    }));
  } catch (error) {
    console.error('Erreur searchEntreprisesQuiRecrutent:', error);
    return [];
  }
};

/**
 * Récupère les statistiques du marché du travail
 */
export const getStatsMarcheEmploi = async (
  codeRome: string,
  codeRegion?: string
): Promise<StatsMarche | null> => {
  try {
    const params = new URLSearchParams({
      endpoint: 'marche',
      codeRome,
    });
    if (codeRegion) params.append('codeRegion', codeRegion);

    const response = await fetch(`${API_PROXY_URL}?${params}`);
    
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Erreur getStatsMarcheEmploi:', error);
    return null;
  }
};

/**
 * Recherche d'offres d'emploi
 */
export const searchOffres = async (params: {
  motsCles?: string;
  commune?: string;
  codeRome?: string;
  typeContrat?: string;
  range?: string;
}): Promise<{ offres: OffreFranceTravail[]; total: number }> => {
  try {
    const queryParams = new URLSearchParams({ endpoint: 'offres' });
    if (params.motsCles) queryParams.append('motsCles', params.motsCles);
    if (params.commune) queryParams.append('commune', params.commune);
    if (params.codeRome) queryParams.append('codeRome', params.codeRome);
    if (params.typeContrat) queryParams.append('typeContrat', params.typeContrat);
    queryParams.append('range', params.range || '0-14');

    const response = await fetch(`${API_PROXY_URL}?${queryParams}`);
    
    if (!response.ok) {
      return { offres: [], total: 0 };
    }

    const data = await response.json();
    return {
      offres: data.resultats || [],
      total: data.resultats?.length || 0,
    };
  } catch (error) {
    console.error('Erreur searchOffres:', error);
    return { offres: [], total: 0 };
  }
};

/**
 * Recherche de demandeurs d'emploi (nécessite agrément)
 */
export const searchDemandeursEmploi = async (params: {
  codeRome?: string;
  codePostal?: string;
  distance?: number;
}): Promise<ProfilDemandeur[]> => {
  // Cette API nécessite un agrément partenaire spécifique
  // Pour l'instant, retourner un tableau vide
  console.log('searchDemandeursEmploi: Fonctionnalité réservée aux partenaires agréés');
  return [];
};

// ==================== HELPERS ====================

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
 * Vérifie si France Travail est configuré (toujours vrai car géré côté serveur)
 */
export const isFranceTravailConfigured = (): boolean => {
  return true; // La config est côté serveur maintenant
};
