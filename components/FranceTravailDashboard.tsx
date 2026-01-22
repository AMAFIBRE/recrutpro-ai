import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Users, TrendingUp, Search, Loader2, AlertCircle,
  ExternalLink, Phone, Mail, Briefcase, Euro, Target, ChevronRight,
  RefreshCw, CheckCircle, XCircle, Info, Globe, Zap
} from 'lucide-react';
import {
  isFranceTravailConfigured,
  searchMetiers,
  getCompetencesByRome,
  searchEntreprisesQuiRecrutent,
  getStatsMarcheEmploi,
  searchOffres,
  searchDemandeursEmploi,
  RomeMetier,
  RomeCompetence,
  Entreprise,
  StatsMarche,
  OffreFranceTravail,
  ProfilDemandeur,
  VILLES_06,
} from '../services/franceTravailService';

interface Props {
  onClose: () => void;
}

type TabType = 'marche' | 'entreprises' | 'offres' | 'candidats';

export const FranceTravailDashboard: React.FC<Props> = ({ onClose }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('marche');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVille, setSelectedVille] = useState('Nice');
  const [selectedRome, setSelectedRome] = useState<RomeMetier | null>(null);

  // Results state
  const [metiers, setMetiers] = useState<RomeMetier[]>([]);
  const [competences, setCompetences] = useState<RomeCompetence[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [statsMarche, setStatsMarche] = useState<StatsMarche | null>(null);
  const [offres, setOffres] = useState<OffreFranceTravail[]>([]);
  const [candidats, setCandidats] = useState<ProfilDemandeur[]>([]);

  useEffect(() => {
    setIsConfigured(isFranceTravailConfigured());
  }, []);

  // Recherche de métiers ROME
  const handleSearchMetiers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchMetiers(searchQuery);
      setMetiers(results);
      if (results.length > 0) {
        setSelectedRome(results[0]);
        // Charger les compétences du premier résultat
        const comps = await getCompetencesByRome(results[0].code);
        setCompetences(comps);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les stats du marché
  const loadStatsMarche = async () => {
    if (!selectedRome) return;
    setLoading(true);
    setError(null);
    try {
      const stats = await getStatsMarcheEmploi(selectedRome.code, '93'); // PACA
      setStatsMarche(stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rechercher les entreprises qui recrutent
  const loadEntreprises = async () => {
    if (!selectedRome) return;
    setLoading(true);
    setError(null);
    try {
      const ville = VILLES_06[selectedVille];
      const results = await searchEntreprisesQuiRecrutent(
        selectedRome.code,
        ville.lat,
        ville.lon,
        30
      );
      setEntreprises(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rechercher les offres
  const loadOffres = async () => {
    if (!selectedRome) return;
    setLoading(true);
    setError(null);
    try {
      const ville = VILLES_06[selectedVille];
      const results = await searchOffres({
        codeRome: selectedRome.code,
        commune: ville.cp,
      });
      setOffres(results.offres);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rechercher les candidats
  const loadCandidats = async () => {
    if (!selectedRome) return;
    setLoading(true);
    setError(null);
    try {
      const ville = VILLES_06[selectedVille];
      const results = await searchDemandeursEmploi({
        codeRome: selectedRome.code,
        codePostal: ville.cp,
        distance: 30,
      });
      setCandidats(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet
  useEffect(() => {
    if (!selectedRome) return;
    
    switch (activeTab) {
      case 'marche':
        loadStatsMarche();
        break;
      case 'entreprises':
        loadEntreprises();
        break;
      case 'offres':
        loadOffres();
        break;
      case 'candidats':
        loadCandidats();
        break;
    }
  }, [activeTab, selectedRome, selectedVille]);

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Configuration requise</h2>
          <p className="text-slate-600 mb-4">
            Les credentials France Travail ne sont pas configurés dans Vercel.
          </p>
          <div className="bg-slate-100 rounded-lg p-4 text-left text-sm">
            <p className="font-mono text-xs">
              VITE_FRANCE_TRAVAIL_CLIENT_ID=...<br/>
              VITE_FRANCE_TRAVAIL_CLIENT_SECRET=...
            </p>
          </div>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-200 rounded-lg">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl mx-auto my-4 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#162766] to-[#2a4494] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#162766] font-bold text-sm">FT</span>
            </div>
            <div className="text-white">
              <h2 className="font-bold text-lg">France Travail</h2>
              <p className="text-xs text-white/70">Données emploi en temps réel</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchMetiers()}
                placeholder="Rechercher un métier (ex: Maçon, Cariste, Plombier...)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={selectedVille}
              onChange={(e) => setSelectedVille(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white"
            >
              {Object.keys(VILLES_06).map(ville => (
                <option key={ville} value={ville}>{ville}</option>
              ))}
            </select>
            <button
              onClick={handleSearchMetiers}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2.5 bg-[#162766] text-white font-bold rounded-xl hover:bg-[#0d1a4a] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Rechercher
            </button>
          </div>

          {/* Métiers trouvés */}
          {metiers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {metiers.slice(0, 5).map(metier => (
                <button
                  key={metier.code}
                  onClick={() => setSelectedRome(metier)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedRome?.code === metier.code
                      ? 'bg-[#162766] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#162766]'
                  }`}
                >
                  {metier.libelle} ({metier.code})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {[
            { id: 'marche', label: 'Marché du travail', icon: TrendingUp },
            { id: 'entreprises', label: 'Entreprises qui recrutent', icon: Building2 },
            { id: 'offres', label: 'Offres en ligne', icon: Briefcase },
            { id: 'candidats', label: 'Candidats disponibles', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'text-[#162766] border-b-2 border-[#162766] bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {!selectedRome ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700">Recherchez un métier</h3>
              <p className="text-slate-500 mt-1">Entrez un mot-clé pour commencer l'analyse</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#162766] animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Chargement des données France Travail...</p>
            </div>
          ) : (
            <>
              {/* TAB: Marché du travail */}
              {activeTab === 'marche' && statsMarche && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl">
                    <Briefcase className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{statsMarche.offres || 'N/A'}</p>
                    <p className="text-sm opacity-80">Offres actives</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl">
                    <Users className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{statsMarche.demandeurs || 'N/A'}</p>
                    <p className="text-sm opacity-80">Demandeurs d'emploi</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-xl">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{statsMarche.tension?.toFixed(2) || 'N/A'}</p>
                    <p className="text-sm opacity-80">Tension du marché</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl">
                    <Euro className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-bold">{statsMarche.salaires?.salaireMoyen || 'N/A'}€</p>
                    <p className="text-sm opacity-80">Salaire moyen</p>
                  </div>
                </div>
              )}

              {/* TAB: Entreprises */}
              {activeTab === 'entreprises' && (
                <div className="space-y-3">
                  {entreprises.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Aucune entreprise trouvée pour ce métier</p>
                  ) : (
                    entreprises.map((ent, idx) => (
                      <div key={ent.siret || idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{ent.nom}</h4>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {ent.codePostal} {ent.ville}
                              {ent.distance && <span className="text-xs">({ent.distance} km)</span>}
                            </p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Recrute potentiellement
                          </span>
                        </div>
                        {ent.contact?.email && (
                          <a href={`mailto:${ent.contact.email}`} className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                            <Mail className="w-4 h-4" /> {ent.contact.email}
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: Offres */}
              {activeTab === 'offres' && (
                <div className="space-y-3">
                  {offres.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Aucune offre trouvée</p>
                  ) : (
                    offres.map((offre, idx) => (
                      <div key={offre.id || idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{offre.intitule}</h4>
                            <p className="text-sm text-blue-600 font-medium">{offre.entreprise?.nom}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {offre.lieuTravail?.libelle}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {offre.typeContrat}
                            </span>
                            {offre.salaire?.libelle && (
                              <p className="text-xs text-slate-500 mt-2">{offre.salaire.libelle}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{offre.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: Candidats */}
              {activeTab === 'candidats' && (
                <div className="space-y-3">
                  {candidats.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <h4 className="font-medium text-slate-700">Accès restreint</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        L'accès aux profils candidats nécessite un agrément partenaire France Travail.
                      </p>
                      <a 
                        href="https://francetravail.io/nous-contacter"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Demander un agrément <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    candidats.map((candidat, idx) => (
                      <div key={candidat.identifiant || idx} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                            {candidat.prenom?.[0]}{candidat.nom?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{candidat.prenom} {candidat.nom}</h4>
                            <p className="text-sm text-slate-500">{candidat.metierRecherche}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Compétences ROME */}
              {competences.length > 0 && activeTab === 'marche' && (
                <div className="mt-6">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#162766]" />
                    Compétences clés pour ce métier
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {competences.slice(0, 15).map((comp, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                        {comp.libelle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Données fournies par France Travail • Actualisées en temps réel
        </div>
      </div>
    </div>
  );
};
