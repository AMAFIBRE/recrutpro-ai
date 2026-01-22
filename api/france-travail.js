// Vercel Serverless Function - Proxy pour France Travail API
// Résout le problème de CORS

const FRANCE_TRAVAIL_CLIENT_ID = process.env.VITE_FRANCE_TRAVAIL_CLIENT_ID;
const FRANCE_TRAVAIL_CLIENT_SECRET = process.env.VITE_FRANCE_TRAVAIL_CLIENT_SECRET;
const AUTH_URL = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire';
const API_BASE_URL = 'https://api.francetravail.io/partenaire';

// Cache du token
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken(scopes) {
  // Vérifier le cache
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
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
    throw new Error(`Erreur auth: ${response.status}`);
  }

  const data = await response.json();
  
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);

  return data.access_token;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, ...params } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  try {
    let scopes = [];
    let apiUrl = '';

    // Router vers les différentes APIs
    switch (endpoint) {
      case 'metiers':
        scopes = ['api_rome-metiersv1', 'nomenclatureRome'];
        apiUrl = `${API_BASE_URL}/rome-metiers/v1/metiers?libelle=${encodeURIComponent(params.keyword || '')}`;
        break;

      case 'competences':
        scopes = ['api_rome-competencesv1', 'nomenclatureRome'];
        apiUrl = `${API_BASE_URL}/rome-competences/v1/competence?code=${params.codeRome}`;
        break;

      case 'labonneboite':
        scopes = ['api_labonneboitev2', 'labonneboite'];
        apiUrl = `${API_BASE_URL}/labonneboite/v2/companies?rome_codes=${params.codeRome}&latitude=${params.lat}&longitude=${params.lon}&distance=${params.distance || 30}`;
        break;

      case 'offres':
        scopes = ['api_offresdemploiv2', 'o2dsoffre'];
        const offreParams = new URLSearchParams();
        if (params.motsCles) offreParams.append('motsCles', params.motsCles);
        if (params.codeRome) offreParams.append('codeRome', params.codeRome);
        if (params.commune) offreParams.append('commune', params.commune);
        offreParams.append('range', params.range || '0-14');
        apiUrl = `${API_BASE_URL}/offresdemploi/v2/offres/search?${offreParams}`;
        break;

      case 'marche':
        scopes = ['api_infotravailv1', 'offresdemploi'];
        apiUrl = `${API_BASE_URL}/infotravail/v1/marche?codeRome=${params.codeRome}`;
        if (params.codeRegion) apiUrl += `&codeRegion=${params.codeRegion}`;
        break;

      default:
        return res.status(400).json({ error: 'Unknown endpoint' });
    }

    const token = await getAccessToken(scopes);

    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Erreur API ${endpoint}:`, errorText);
      return res.status(apiResponse.status).json({ 
        error: `API Error: ${apiResponse.status}`,
        details: errorText 
      });
    }

    const data = await apiResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erreur proxy:', error);
    return res.status(500).json({ error: error.message });
  }
}
