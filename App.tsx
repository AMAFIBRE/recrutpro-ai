import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { JobForm } from './components/JobForm';
import { AdPreview } from './components/AdPreview';
import { ApplicationPage } from './components/ApplicationPage';
import { ApplicationsDashboard } from './components/ApplicationsDashboard';
import { PublishModal } from './components/PublishModal';
import { FranceTravailDashboard } from './components/FranceTravailDashboard';
import { JobFormData, GeneratedAd, GenerationResponse } from './types';
import { INITIAL_FORM_DATA } from './constants';
import { generateJobAds } from './services/geminiService';
import { Sparkles, Key, History, Clock, ArrowRight, Users, Rocket, Globe } from 'lucide-react';

type AppView = 'main' | 'apply' | 'dashboard';

function App() {
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM_DATA);
  const [generationResponse, setGenerationResponse] = useState<GenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // View & Routing state
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [applySlug, setApplySlug] = useState<string | null>(null);
  
  // Publish Modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedAdForPublish, setSelectedAdForPublish] = useState<GeneratedAd | null>(null);
  
  // History State
  const [history, setHistory] = useState<{formData: JobFormData, response: GenerationResponse}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // France Travail Dashboard state
  const [showFranceTravail, setShowFranceTravail] = useState(false);

  // Handle URL routing
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      
      // Route: /postuler/:slug
      if (path.startsWith('/postuler/')) {
        const slug = path.replace('/postuler/', '');
        setApplySlug(slug);
        setCurrentView('apply');
        return;
      }
      
      // Route: /dashboard
      if (path === '/dashboard' || path === '/candidatures') {
        setCurrentView('dashboard');
        return;
      }
      
      // Default: main app
      setCurrentView('main');
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  // Navigation helpers
  const navigateTo = (view: AppView, slug?: string) => {
    if (view === 'apply' && slug) {
      window.history.pushState({}, '', `/postuler/${slug}`);
      setApplySlug(slug);
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
  };

  // Load History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('recrutpro_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { console.error("Failed to load history", e); }
    }
  }, []);

  // Check for API Key on mount (Vite uses import.meta.env)
  useEffect(() => {
    const apiKey = (import.meta as any).env?.VITE_API_KEY;
    if (apiKey) {
      setHasApiKey(true);
    }
  }, []);

  const saveToHistory = (data: JobFormData, res: GenerationResponse) => {
     const newItem = { formData: data, response: res };
     const newHistory = [newItem, ...history].slice(0, 10);
     setHistory(newHistory);
     localStorage.setItem('recrutpro_history', JSON.stringify(newHistory));
  };

  const loadFromHistory = (item: {formData: JobFormData, response: GenerationResponse}) => {
    setFormData(item.formData);
    setGenerationResponse(item.response);
    setShowHistory(false);
  };

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    setGenerationResponse(null);

    try {
      const response = await generateJobAds(formData);
      setGenerationResponse(response);
      saveToHistory(formData, response);
      
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }

    } catch (err: any) {
      console.error("Error generating ads:", err);
      setError(err.message || "Une erreur est survenue lors de la génération. Veuillez vérifier votre clé API ou réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAd = (ad: GeneratedAd) => {
    setSelectedAdForPublish(ad);
    setShowPublishModal(true);
  };

  // Render: Application Page (public)
  if (currentView === 'apply' && applySlug) {
    return (
      <ApplicationPage 
        slug={applySlug} 
        onBack={() => navigateTo('main')} 
      />
    );
  }

  // Render: Dashboard
  if (currentView === 'dashboard') {
    return (
      <ApplicationsDashboard 
        onBack={() => navigateTo('main')} 
      />
    );
  }

  // Show error if no API key configured
  if (!hasApiKey) {
     return (
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
             <Key className="w-8 h-8 text-red-600" />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Configuration requise</h1>
             <p className="text-slate-500 mt-2">La clé API Gemini n'est pas configurée. Contactez l'administrateur.</p>
           </div>
         </div>
       </div>
     )
  }

  // Render: Main App
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 relative">
      <Header />

      {/* Dashboard & History Buttons */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2 md:hidden">
        <button 
          onClick={() => setShowFranceTravail(true)}
          className="bg-[#162766] text-white shadow-xl rounded-full p-3 hover:bg-[#0d1a4a] transition-all"
        >
          <Globe className="w-6 h-6" />
        </button>
        <button 
          onClick={() => navigateTo('dashboard')}
          className="bg-blue-600 text-white shadow-xl rounded-full p-3 hover:bg-blue-700 transition-all"
        >
          <Users className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowHistory(true)}
          className="bg-white border border-slate-200 shadow-xl rounded-full p-3 text-slate-600 hover:text-blue-600 hover:scale-105 transition-all"
        >
          <History className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar Buttons */}
      <div className="fixed top-24 right-0 z-30 hidden lg:flex flex-col gap-1">
         <button 
           onClick={() => setShowFranceTravail(true)}
           className="bg-[#162766] text-white border-l border-y border-[#0d1a4a] shadow-md rounded-l-xl p-3 hover:pl-4 transition-all flex items-center gap-2"
         >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-bold writing-vertical-lr">FRANCE TRAVAIL</span>
         </button>
         <button 
           onClick={() => navigateTo('dashboard')}
           className="bg-blue-600 text-white border-l border-y border-blue-700 shadow-md rounded-l-xl p-3 hover:pl-4 transition-all flex items-center gap-2"
         >
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold writing-vertical-lr">CANDIDATURES</span>
         </button>
         <button 
           onClick={() => setShowHistory(!showHistory)}
           className="bg-white border-l border-y border-slate-200 shadow-md rounded-l-xl p-3 text-slate-500 hover:text-blue-600 hover:pl-4 transition-all flex items-center gap-2"
         >
            <History className="w-5 h-5" />
            <span className="text-xs font-bold writing-vertical-lr">HISTORIQUE</span>
         </button>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
            <div className="flex-grow">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <span className="sr-only">Fermer</span>
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
             <div className="lg:sticky lg:top-24">
                <JobForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleGenerate} 
                  isLoading={isLoading} 
                />
                
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex gap-3">
                    <div className="shrink-0 pt-0.5">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Conseil Pro</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Pour de meilleurs résultats, précisez le secteur d'activité pour que l'IA adapte le vocabulaire (ex: CACES pour la Logistique).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Dashboard Access */}
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Voir les candidatures
                </button>
             </div>
          </div>

          {/* Right Column: Results */}
          <div id="results-section" className="lg:col-span-7 xl:col-span-8 min-h-[500px]">
            {generationResponse && generationResponse.ads.length > 0 ? (
              <>
                <AdPreview 
                  ads={generationResponse.ads} 
                  fullResponse={generationResponse} 
                  formData={formData}
                  onPublish={handlePublishAd}
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                {isLoading ? (
                  <div className="animate-pulse space-y-4 max-w-md w-full">
                     <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
                     <div className="space-y-2 mt-8">
                        <div className="h-2 bg-slate-200 rounded"></div>
                        <div className="h-2 bg-slate-200 rounded"></div>
                        <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Sparkles className="w-8 h-8 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700">Vos annonces apparaîtront ici</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                      Remplissez le formulaire à gauche pour générer instantanément 3 versions optimisées de votre offre d'emploi.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* HISTORY DRAWER */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
           <div className="relative bg-white w-full max-w-md shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h2 className="font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-blue-600" /> Historique</h2>
                 <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-200 rounded-full"><ArrowRight className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {history.length === 0 ? (
                   <div className="text-center text-slate-400 mt-10">
                     <p>Aucun historique.</p>
                   </div>
                 ) : (
                   history.map((item, idx) => (
                     <button 
                       key={item.response?.id || idx}
                       onClick={() => loadFromHistory(item)}
                       className="w-full text-left bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
                     >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 truncate">{item.formData.jobTitle}</h3>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{item.formData.contractType}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2 truncate">{item.formData.companyName}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {item.response?.timestamp ? new Date(item.response.timestamp).toLocaleString() : 'Récemment'}
                        </div>
                     </button>
                   ))
                 )}
              </div>
           </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {selectedAdForPublish && (
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => {
            setShowPublishModal(false);
            setSelectedAdForPublish(null);
          }}
          formData={formData}
          ad={selectedAdForPublish}
        />
      )}

      {/* FRANCE TRAVAIL DASHBOARD */}
      {showFranceTravail && (
        <FranceTravailDashboard onClose={() => setShowFranceTravail(false)} />
      )}
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">
            ADVANCE EMPLOI 06 <span className="text-slate-400 font-normal">by</span> <span className="text-blue-600">RecrutPro IA</span>
          </p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Tous droits réservés. Conforme RGPD & Droit du travail français.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
