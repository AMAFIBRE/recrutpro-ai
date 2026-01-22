# RecrutPro AI - Générateur d'Annonces d'Emploi

Suite RH propulsée par **Gemini 3 Flash** pour générer des annonces d'emploi optimisées en 1 clic.

## ✨ Fonctionnalités

- 🎯 **3 versions d'annonces** : LinkedIn, Jobboard, Réseaux sociaux
- 🔍 **Requête booléenne** : Pour sourcer des candidats
- ✉️ **Email de chasse** : Approche directe personnalisée
- ❓ **Questions d'entretien** : Avec critères d'évaluation
- 🖼️ **Image générée** : Visuel pro pour réseaux sociaux
- 📄 **Export PDF** : Téléchargement du kit complet

---

## 🚀 Déploiement sur Vercel (5 min)

### Étape 1 : Obtenir une clé API Gemini

1. Va sur https://aistudio.google.com/apikey
2. Clique sur **"Create API Key"**
3. Copie la clé générée

### Étape 2 : Déployer sur Vercel

1. **Fork ou upload** ce repo sur GitHub
2. Va sur https://vercel.com et connecte ton compte GitHub
3. Clique **"Add New Project"** → sélectionne le repo
4. Dans **"Environment Variables"**, ajoute :
   - Name: `API_KEY`
   - Value: `ta_cle_api_gemini`
5. Clique **"Deploy"**

C'est tout ! Ton app sera live en ~2 minutes sur `https://ton-projet.vercel.app`

---

## 💻 Développement local

```bash
# 1. Cloner le projet
git clone https://github.com/ton-repo/recrutpro-ai.git
cd recrutpro-ai

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API
cp .env.example .env.local
# Édite .env.local et ajoute ta clé API

# 4. Lancer le serveur
npm run dev
```

L'app sera accessible sur http://localhost:5173

---

## 📁 Structure du projet

```
recrutpro-ai/
├── App.tsx              # Composant principal
├── index.tsx            # Point d'entrée React
├── index.html           # Template HTML
├── services/
│   └── geminiService.ts # Appels API Gemini
├── components/
│   ├── Header.tsx       # En-tête
│   ├── JobForm.tsx      # Formulaire de saisie
│   └── AdPreview.tsx    # Affichage des résultats
├── types.ts             # Types TypeScript
├── constants.ts         # Constantes
└── vercel.json          # Config Vercel
```

---

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `API_KEY` | Clé API Google Gemini | ✅ Oui |

### Modèles utilisés

- **gemini-3-flash-preview** : Génération de texte (annonces, emails, questions)
- **gemini-2.5-flash-image** : Génération d'images

---

## 💰 Coûts API Gemini

| Modèle | Input | Output |
|--------|-------|--------|
| Gemini 3 Flash | $0.50/1M tokens | $3/1M tokens |
| Gemini 2.5 Flash Image | Variable | Variable |

**Estimation** : ~$0.01-0.02 par génération complète

---

## 📞 Support

Développé par [Votre Entreprise]

---

## 📜 Licence

Propriétaire - Tous droits réservés
