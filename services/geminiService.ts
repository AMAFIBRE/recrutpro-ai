import { GoogleGenAI, Type } from "@google/genai";
import { JobFormData, GenerationResponse, ContractType } from '../types';

const getClient = () => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || '';
  if (!apiKey) {
    throw new Error("Clé API manquante. Configurez VITE_API_KEY dans Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- FONCTION 1 : AUTO-COMPLÉTION DU FORMULAIRE ---
export const suggestJobDetails = async (jobTitle: string): Promise<Partial<JobFormData>> => {
  const ai = getClient();
  const prompt = `
    Tu es un expert en recrutement français, spécialisé dans l'intérim et le placement sur la Côte d'Azur (06).
    À partir du titre de poste : "${jobTitle}", déduis les détails les plus probables.
    
    Contexte : Marché du travail en France, région PACA / Côte d'Azur.
    
    Champs à remplir :
    - sector: Le secteur d'activité le plus logique.
    - contractType: Le type de contrat standard pour ce poste.
    - remotePolicy: La politique de télétravail habituelle pour ce métier.
    - salary: Une fourchette de salaire réaliste pour la région 06 (brut annuel ou taux horaire pour intérim).
    - description: 3 à 4 missions principales courtes et percutantes.
    - skills: Liste de 4-5 compétences clés (techniques + certifications requises si applicable comme CACES, habilitations, permis).

    Réponds UNIQUEMENT au format JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sector: { type: Type.STRING },
            contractType: { type: Type.STRING, enum: Object.values(ContractType) },
            remotePolicy: { type: Type.STRING },
            salary: { type: Type.STRING },
            description: { type: Type.STRING },
            skills: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return {};
  } catch (error: any) {
    console.error("Erreur Auto-fill:", error);
    if (error.message?.includes('404') || error.message?.includes('not found')) {
         throw new Error("Modèle IA indisponible. Vérifiez votre clé API.");
    }
    throw error;
  }
};

// --- FONCTION 2 : IMAGE PLACEHOLDER (Unsplash gratuit) ---
const getJobImage = (jobTitle: string, sector: string): string => {
  // Images Unsplash gratuites par secteur
  const sectorImages: Record<string, string> = {
    'BTP': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop',
    'Bâtiment': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop',
    'Construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop',
    'Logistique': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    'Transport': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    'Industrie': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop',
    'Commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    'Vente': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    'Restauration': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop',
    'Hôtellerie': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop',
    'Santé': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=450&fit=crop',
    'Médical': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=450&fit=crop',
    'IT': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
    'Tech': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
    'Informatique': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
    'Agriculture': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=450&fit=crop',
    'Nettoyage': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=450&fit=crop',
    'Sécurité': 'https://images.unsplash.com/photo-1555817128-342e1c8b3101?w=800&h=450&fit=crop',
  };

  // Chercher une correspondance par mot-clé
  const sectorLower = sector.toLowerCase();
  for (const [key, url] of Object.entries(sectorImages)) {
    if (sectorLower.includes(key.toLowerCase())) {
      return url;
    }
  }

  // Image par défaut (bureau/travail)
  return 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=450&fit=crop';
};

// --- FONCTION 3 : GÉNÉRATION DES ANNONCES (OPTIMISÉE) ---
export const generateJobAds = async (data: JobFormData): Promise<GenerationResponse> => {
  const ai = getClient();
  
  const interimInfo = data.contractType === ContractType.INTERIM && data.interimBenefits?.length
    ? `🚨 IMPORTANT : C'est une mission d'INTÉRIM. 
       - Inclus obligatoirement une section "Avantages Intérim" avec : ${data.interimBenefits.join(', ')}.
       - Mentionne la possibilité de renouvellement/CDI si mission concluante.
       - Précise que c'est via ADVANCE EMPLOI 06, agence d'intérim de confiance.`
    : '';

  const benefitsInfo = data.benefits?.length
    ? `Avantages entreprise à mentionner : ${data.benefits.join(', ')}.`
    : '';

  const urgentInfo = data.isUrgent 
    ? `⚡ RECRUTEMENT URGENT : Ajoute un sentiment d'urgence dans les annonces. Mentionne "Poste à pourvoir immédiatement" ou "Démarrage rapide".`
    : '';

  const systemInstruction = `
    Tu es l'assistant IA de RecrutPro, travaillant pour ADVANCE EMPLOI 06, une agence d'intérim et de recrutement basée sur la Côte d'Azur.
    Tu es un expert Copywriter RH avec 15 ans d'expérience sur le marché français.
    
    🎯 TA MISSION : Créer des annonces d'emploi EXCEPTIONNELLES qui se démarquent de la concurrence.
    
    📋 RÈGLES D'OR POUR LES ANNONCES :
    1. AÈRE LE TEXTE : Utilise "\\n\\n" pour séparer chaque section. JAMAIS de blocs compacts.
    2. STRUCTURE OBLIGATOIRE :
       - Titre accrocheur avec emoji pertinent
       - Intro engageante (2-3 lignes max) qui donne envie
       - "\\n\\n🎯 VOS MISSIONS :\\n" puis liste avec "• " pour chaque mission (verbes d'action)
       - "\\n\\n👤 VOTRE PROFIL :\\n" puis liste avec "• " pour chaque critère
       - "\\n\\n🎁 NOS AVANTAGES :\\n" puis liste avec "• " pour chaque avantage
       - "\\n\\n📩 POSTULEZ :" puis call-to-action percutant
    3. ADAPTATION PAR CANAL :
       - LinkedIn : Conversationnel, emojis pros (🚀💼🎯), storytelling, tutoiement OK
       - Jobboard : Formel, vouvoiement, très structuré, précis, PAS d'emojis
       - Social : Ultra court (280 car max), punchy, hashtags tendance, 1-2 emojis
    4. SEO : Inclure des mots-clés pertinents pour le référencement (nom du poste, ville, compétences clés)
    5. INTERDICTIONS : Pas de discrimination (âge, sexe, origine), orthographe parfaite.
    
    📞 RÈGLES POUR SMS ET MESSAGE VOCAL :
    - SMS : Max 160 caractères, direct, avec call-to-action
    - Message vocal : Script naturel de 20-30 secondes, ton professionnel mais chaleureux
    
    💡 RÈGLES POUR L'ANALYSE :
    - Score SEO : Basé sur présence mots-clés, structure, longueur optimale
    - Score Attractivité : Basé sur avantages, clarté, ton engageant
    - Toujours donner des suggestions d'amélioration concrètes
    
    ❓ RÈGLES POUR LES QUESTIONS D'ENTRETIEN :
    - Chaque question DOIT être directement liée aux COMPÉTENCES ou MISSIONS du poste
    - Inclure des mises en situation concrètes
    - Critères d'évaluation précis et mesurables
  `;

  const prompt = `
    Génère un kit de recrutement COMPLET et PREMIUM pour ce poste :
    
    📋 INFORMATIONS DU POSTE :
    - Intitulé exact : ${data.jobTitle}
    - Entreprise cliente : ${data.isConfidential ? "Confidentiel (via ADVANCE EMPLOI 06)" : data.companyName}
    - Type de contrat : ${data.contractType}
    - Niveau d'expérience : ${data.experienceLevel}
    - Localisation : ${data.location} (${data.remotePolicy})
    - Rémunération : ${data.salary}
    - Secteur : ${data.sector}
    - Missions : ${data.description}
    - Compétences requises : ${data.skills}
    - Ton souhaité : ${data.tone}
    
    ${interimInfo}
    ${benefitsInfo}
    ${urgentInfo}

    📝 À GÉNÉRER (TOUT EST OBLIGATOIRE) :
    
    1. TROIS ANNONCES (LinkedIn, Jobboard, Social) - Structure parfaite avec "\\n\\n"
    
    2. REQUÊTE BOOLÉENNE avancée pour LinkedIn/Indeed/CVthèques
    
    3. EMAIL DE CHASSE percutant (objet + corps) pour approche directe
    
    4. TROIS QUESTIONS D'ENTRETIEN ultra-spécifiques :
       - 1 TECHNIQUE liée à : ${data.skills.split(',')[0] || data.skills}
       - 1 SOFT SKILLS avec mise en situation
       - 1 MOTIVATION liée au secteur ${data.sector}
       - Avec greenFlags (bonnes réponses) et redFlags (alertes)
    
    5. ANALYSE DE L'ANNONCE :
       - seoScore (0-100) : évalue le référencement
       - attractivenessScore (0-100) : évalue l'attractivité
       - marketSalary : fourchette salaire marché pour ce poste en région ${data.location || "PACA"}
       - competitorComparison : comment se positionne cette offre vs marché
       - improvements : 3 suggestions concrètes d'amélioration
    
    6. SMS TEMPLATE (max 160 car) pour relance candidat
    
    7. SCRIPT MESSAGE VOCAL (20-30 sec) pour premier contact téléphonique
  `;

  const textPromise = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ads: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                channel: { type: Type.STRING, enum: ['LinkedIn', 'Jobboard', 'Social'] },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['channel', 'title', 'content', 'seoKeywords']
            }
          },
          booleanSearch: { type: Type.STRING },
          huntingEmail: { type: Type.STRING },
          interviewQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, enum: ['Technique', 'Soft Skills', 'Culture & Motivation'] },
                question: { type: Type.STRING },
                linkedTo: { type: Type.STRING },
                evaluationCriteria: { type: Type.STRING },
                greenFlags: { type: Type.STRING },
                redFlags: { type: Type.STRING }
              },
              required: ['category', 'question', 'linkedTo', 'evaluationCriteria']
            }
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              seoScore: { type: Type.NUMBER },
              attractivenessScore: { type: Type.NUMBER },
              marketSalary: { type: Type.STRING },
              competitorComparison: { type: Type.STRING },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['seoScore', 'attractivenessScore', 'marketSalary', 'improvements']
          },
          smsTemplate: { type: Type.STRING },
          voicemailScript: { type: Type.STRING }
        },
        required: ['ads', 'booleanSearch', 'huntingEmail', 'interviewQuestions', 'analysis', 'smsTemplate', 'voicemailScript']
      }
    }
  });

  try {
    const textResponse = await textPromise;

    if (!textResponse.text) {
      throw new Error("L'IA n'a renvoyé aucun texte.");
    }

    const res = JSON.parse(textResponse.text) as GenerationResponse;

    // Ajouter l'image Unsplash à l'annonce Social
    const socialAd = res.ads.find(ad => ad.channel === 'Social');
    if (socialAd) {
      socialAd.imageUrl = getJobImage(data.jobTitle, data.sector);
    }

    res.timestamp = Date.now();
    res.id = Math.random().toString(36).substring(7);

    return res;

  } catch (error: any) {
    console.error("Erreur critique génération:", error);
    if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error("Service IA temporairement indisponible (Erreur Modèle).");
    }
    throw error;
  }
};
