import React, { useState } from 'react';
import { GeneratedAd, JobFormData, GenerationResponse, ContractType } from '../types';
import { 
  Copy, Check, ExternalLink, Linkedin, Briefcase, Hash, Globe, 
  ThumbsUp, MessageSquare, Share, Send, MoreHorizontal,
  Code2, Users, Mail, Target, HelpCircle, PenTool, Building2, MapPin, 
  Bookmark, X, Paperclip, ChevronDown, Clock, Search, Rocket, Heart, Repeat, Coins, FileDown, Printer, Image
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Déclaration pour TypeScript
declare const html2pdf: any;

interface AdPreviewProps {
  ads: GeneratedAd[];
  formData?: JobFormData;
  fullResponse?: GenerationResponse;
  onPublish?: (ad: GeneratedAd) => void;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ ads, formData, fullResponse, onPublish }) => {
  const [viewMode, setViewMode] = useState<'ADS' | 'SOURCING' | 'INTERVIEW'>('ADS');
  const [activeAdTab, setActiveAdTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const currentAds = fullResponse?.ads || ads;
  const currentAd = currentAds && currentAds.length > 0 ? currentAds[activeAdTab] : null;

  if (!currentAds || currentAds.length === 0) return null;

  // --- UTILS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\\n/g, '\n') // Corrige les sauts de ligne échappés
      .trim();
  };

  const copyToClipboard = (text: string, label: string = "Copié !") => {
    navigator.clipboard.writeText(cleanText(text));
    setCopied(true);
    showToast(label);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copier le texte puis ouvrir le lien
  const copyAndOpen = (url: string, text: string, platformName: string) => {
    navigator.clipboard.writeText(cleanText(text));
    showToast(`✅ Texte copié ! Collez-le sur ${platformName}`);
    setTimeout(() => {
      window.open(url, '_blank');
    }, 500);
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'RP';

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('export-container');
    const opt = {
      margin: [10, 10, 15, 10], // top, left, bottom, right
      filename: `ADVANCE_EMPLOI_06_${formData?.jobTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Afficher temporairement le container d'export caché
    if(element) {
        element.style.display = 'block';
        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none';
            setIsExporting(false);
            showToast("Dossier Recrutement Téléchargé !");
        });
    }
  };

  // --- SUB-COMPONENTS (VIEWS) ---

  const LinkedInView = () => (
    <div className="bg-[#f3f2ef] w-full min-h-[600px] p-4 flex flex-col items-center font-[-apple-system,system-ui,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue','Fira_Sans',Ubuntu,Oxygen,'Oxygen_Sans',Cantarell,'Droid_Sans','Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Lucida_Grande',Helvetica,Arial,sans-serif]">
      <div className="bg-white w-full max-w-[555px] rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] mb-4 overflow-hidden">
         {/* LinkedIn Header */}
         <div className="px-4 pt-3 pb-2 flex items-start gap-3">
             <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm relative overflow-hidden shrink-0">
                {formData?.companyName ? (
                    <span className="z-10 text-blue-700">{getInitials(formData.companyName)}</span>
                ) : 'RP'}
                <div className="absolute inset-0 bg-blue-50 z-0"></div>
             </div>
             <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                   <div className="flex flex-col">
                      <h3 className="text-[14px] font-semibold text-[rgba(0,0,0,0.9)] truncate flex items-center gap-1 hover:text-[#0a66c2] hover:underline cursor-pointer leading-tight">
                        {formData?.isConfidential ? 'Recruteur Confidentiel' : formData?.companyName}
                        <span className="text-[rgba(0,0,0,0.6)] font-normal text-xs">• 1er</span>
                      </h3>
                      <p className="text-[12px] text-[rgba(0,0,0,0.6)] truncate leading-tight mt-0.5">Recrutement & Talents • 345 892 abonnés</p>
                      <p className="text-[12px] text-[rgba(0,0,0,0.6)] flex items-center gap-1 mt-0.5 leading-tight">
                        2h • <Globe className="w-3 h-3 text-[rgba(0,0,0,0.6)]" />
                      </p>
                   </div>
                   <button className="text-[#0a66c2] font-semibold text-sm hover:bg-[#ebf4fd] px-3 py-1 rounded transition-colors flex items-center gap-1 shrink-0">
                      <span className="text-lg leading-none mb-0.5">+</span> Suivre
                   </button>
                </div>
             </div>
         </div>

         {/* LinkedIn Content - AVEC PLUS D'ESPACE */}
         <div className="px-4 py-3 text-[14px] text-[rgba(0,0,0,0.9)] break-words bg-white">
            <div className="font-semibold mb-4 block text-[15px]">{currentAd?.title}</div>
            <ReactMarkdown
               className="whitespace-pre-wrap"
               components={{
                 p: ({node, ...props}) => <p className="mb-5 leading-relaxed" {...props} />, // Grosse marge pour aérer
                 strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                 ul: ({node, ...props}) => <ul className="mb-5 pl-0 space-y-2" {...props} />,
                 li: ({node, ...props}) => <li className="flex items-start gap-2.5"><span className="text-[rgba(0,0,0,0.6)] mt-1.5 text-[6px] shrink-0">●</span><span className="leading-relaxed">{props.children}</span></li>,
                 h1: ({node, ...props}) => <span className="block font-bold mt-6 mb-2 uppercase text-xs tracking-wider text-slate-500" {...props} />,
                 h2: ({node, ...props}) => <span className="block font-bold mt-6 mb-2 uppercase text-xs tracking-wider text-slate-500" {...props} />,
                 h3: ({node, ...props}) => <span className="font-bold block mt-4 mb-2" {...props} />
               }}
            >
              {cleanText(currentAd?.content || '')}
            </ReactMarkdown>
            
            {currentAd?.hashtags && (
              <div className="mt-4 pt-2 text-[#0a66c2] font-semibold hover:underline cursor-pointer text-sm">
                {currentAd.hashtags.join(' ')}
              </div>
            )}
         </div>

         {/* LinkedIn Footer Metrics */}
         <div className="px-4 py-2 flex items-center justify-between mt-1">
             <div className="flex items-center gap-1">
                 <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-[#1485bd] flex items-center justify-center z-10 ring-1 ring-white"><ThumbsUp className="w-2.5 h-2.5 text-white fill-white" /></div>
                    <div className="w-4 h-4 rounded-full bg-[#df704d] flex items-center justify-center z-0 ring-1 ring-white"><span className="text-[8px] text-white">❤️</span></div>
                 </div>
                 <span className="ml-1 text-xs text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2] hover:underline cursor-pointer">84</span>
             </div>
             <div className="text-xs text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2] hover:underline cursor-pointer">12 commentaires • 4 diffusions</div>
         </div>

         {/* LinkedIn Action Bar */}
         <div className="px-2 py-1 flex justify-between border-t border-slate-100">
             <button className="flex-1 py-3 hover:bg-[rgba(0,0,0,0.08)] rounded-md flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] font-semibold text-sm transition-colors group">
                <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[1.5]" /> <span className="hidden sm:inline">J'aime</span>
             </button>
             <button className="flex-1 py-3 hover:bg-[rgba(0,0,0,0.08)] rounded-md flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] font-semibold text-sm transition-colors group">
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[1.5]" /> <span className="hidden sm:inline">Commenter</span>
             </button>
             <button className="flex-1 py-3 hover:bg-[rgba(0,0,0,0.08)] rounded-md flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] font-semibold text-sm transition-colors group">
                <Share className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[1.5]" /> <span className="hidden sm:inline">Diffuser</span>
             </button>
             <button className="flex-1 py-3 hover:bg-[rgba(0,0,0,0.08)] rounded-md flex items-center justify-center gap-2 text-[rgba(0,0,0,0.6)] font-semibold text-sm transition-colors group">
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[1.5]" /> <span className="hidden sm:inline">Envoyer</span>
             </button>
         </div>
      </div>
    </div>
  );

  const JobboardView = () => (
    <div className="border border-slate-200 rounded-xl overflow-hidden font-sans bg-white shadow-sm flex flex-col h-full">
       {/* Hero Banner */}
       <div className="bg-slate-900 h-32 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
       </div>
       
       <div className="px-8 pb-10 relative flex-1">
          {/* Header Card info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-10 mb-8 gap-4">
             <div className="w-20 h-20 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-2xl font-bold text-slate-800 shrink-0">
               {formData?.companyName ? getInitials(formData.companyName) : 'RP'}
             </div>
             <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                   <Bookmark className="w-4 h-4" /> <span className="hidden sm:inline">Sauvegarder</span>
                </button>
                <button className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FFD000] text-slate-900 font-bold text-sm rounded-lg hover:bg-[#ffe04d] transition-colors shadow-sm">
                   Postuler
                </button>
             </div>
          </div>

          <div>
             <h2 className="text-3xl font-bold text-slate-900 mb-6 font-display leading-tight">{currentAd?.title}</h2>
             
             {/* Tags Row */}
             <div className="flex flex-wrap gap-3 text-sm font-medium mb-8">
                <div className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-100">
                    <Building2 className="w-4 h-4 text-slate-400" /> {formData?.companyName}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" /> {formData?.location}
                </div>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100/50">
                    <Briefcase className="w-4 h-4" /> {formData?.contractType}
                </div>
             </div>
             
             {/* INTERIM SPECIFIC BADGE - VISIBLE SI INTÉRIM */}
             {formData?.contractType === ContractType.INTERIM && (
               <div className="mb-10 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-800 font-medium">
                  <span className="flex items-center gap-2"><Coins className="w-4 h-4 text-blue-600" /> +10% IFM</span>
                  <span className="flex items-center gap-2"><Coins className="w-4 h-4 text-blue-600" /> +10% CP</span>
                  <span className="flex items-center gap-2"><Rocket className="w-4 h-4 text-blue-600" /> Accès FASTT</span>
               </div>
             )}
          </div>

          <div className="border-t border-slate-100 pt-10">
             {/* STYLE JOBBOARD NETTEMENT AMELIORÉ */}
             <ReactMarkdown 
               className="prose prose-lg prose-slate max-w-none"
               components={{
                 h1: ({node, ...props}) => <span className="hidden" {...props} />,
                 // Titres de sections très distincts
                 h2: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 mt-12 mb-6 pb-2 border-b border-slate-100 flex items-center gap-3" {...props} />,
                 h3: ({node, ...props}) => <h4 className="text-lg font-bold text-slate-800 mt-8 mb-4" {...props} />,
                 // Listes aérées
                 ul: ({node, ...props}) => <ul className="space-y-3 mb-8" {...props} />,
                 li: ({node, ...props}) => <li className="flex items-start gap-3 pl-0 before:content-none group" {...props}>
                   <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#FFD000] shrink-0"></div>
                   <span className="text-slate-600 leading-relaxed">{props.children}</span>
                 </li>,
                 // Paragraphes avec bonne hauteur de ligne
                 p: ({node, ...props}) => <p className="mb-6 text-slate-600 leading-8" {...props} />
               }}
            >
               {cleanText(currentAd?.content || '')}
            </ReactMarkdown>
          </div>
       </div>
    </div>
  );

  const length = currentAd?.content.length || 0;
  const lengthColor = length > 2800 ? "text-red-500" : length > 2000 ? "text-blue-600" : "text-slate-400";

  return (
    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 overflow-hidden flex flex-col h-full relative ring-1 ring-slate-900/5">
      
      {/* Notifications */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2 animate-fade-in-up">
           <Check className="w-4 h-4 text-green-400" /> {toastMsg}
        </div>
      )}

      {/* Main Navigation (Tabs) */}
      <div className="bg-slate-900 text-white p-2 flex justify-center z-20 sticky top-0 shadow-md">
         <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 backdrop-blur-md">
            {[
              { id: 'ADS', label: 'Annonces', icon: PenTool },
              { id: 'SOURCING', label: 'Sourcing & Chasse', icon: Users },
              { id: 'INTERVIEW', label: 'Guide Entretien', icon: HelpCircle }
            ].map((mode) => (
              <button 
                key={mode.id}
                // @ts-ignore
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <mode.icon className="w-4 h-4" /> <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
         </div>
      </div>

      {/* --- CONTENT AREA --- */}

      {/* 1. ADS VIEW */}
      {viewMode === 'ADS' && (
        <>
          <div className="bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center px-4 py-3 gap-3">
             <div className="flex p-1 bg-slate-100 rounded-lg shrink-0 border border-slate-200">
              {currentAds.map((ad, index) => (
                <button
                  key={index}
                  onClick={() => setActiveAdTab(index)}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all
                    ${activeAdTab === index 
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-500 hover:bg-slate-200/50'}
                  `}
                >
                  {ad.channel === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                  {ad.channel === 'Jobboard' && <Briefcase className="w-4 h-4" />}
                  {ad.channel === 'Social' && <Hash className="w-4 h-4" />}
                  <span className="hidden sm:inline">{ad.channel}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
               <span className={`text-xs font-mono font-bold ${lengthColor}`}>{length} chars</span>
               <div className="h-6 w-px bg-slate-200 mx-1"></div>
               <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Exporter tout en PDF"
               >
                 {isExporting ? <Clock className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                 <span className="hidden sm:inline">Dossier PDF</span>
               </button>
               <button 
                onClick={() => copyToClipboard(currentAd?.content || '')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
                <span className="hidden sm:inline">Copier</span>
              </button>
              {onPublish && currentAd && (
                <button 
                  onClick={() => onPublish(currentAd)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Rocket className="w-4 h-4" /> 
                  <span className="hidden sm:inline">Publier</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 relative">
             {/* Content based on tab */}
             {currentAd?.channel === 'LinkedIn' && <LinkedInView />}
             {currentAd?.channel === 'Jobboard' && <JobboardView />}
             {currentAd?.channel === 'Social' && (
               <div className="flex items-center justify-center min-h-[400px]">
                  <div className="max-w-[500px] w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4 font-sans hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                          <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center font-bold shrink-0">
                            {formData?.companyName ? getInitials(formData.companyName) : 'RP'}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 text-[15px]">
                                  <span className="font-bold text-slate-900 truncate">{formData?.companyName || 'ADVANCE EMPLOI 06'}</span>
                                  <span className="text-slate-500 truncate">@advanceemploi06</span>
                                  <span className="text-slate-500">·</span>
                                  <span className="text-slate-500">2h</span>
                              </div>
                              <div className="text-[15px] text-slate-900 mt-1 whitespace-pre-wrap leading-normal">
                                {cleanText(currentAd.content)}
                                {currentAd.hashtags && (
                                  <div className="text-[#1d9bf0] mt-2">{currentAd.hashtags.join(' ')}</div>
                                )}
                              </div>
                              
                              {/* Social Media Image Placeholder / Generated Image */}
                              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 h-56 w-full flex items-center justify-center text-slate-400 overflow-hidden relative">
                                  {currentAd.imageUrl ? (
                                    <img 
                                      src={currentAd.imageUrl} 
                                      alt="Job Post Image" 
                                      className="w-full h-full object-cover animate-in fade-in duration-700"
                                    />
                                  ) : currentAd.base64Image ? (
                                    <img 
                                      src={`data:image/jpeg;base64,${currentAd.base64Image}`} 
                                      alt="Generated Job Post" 
                                      className="w-full h-full object-cover animate-in fade-in duration-700"
                                    />
                                  ) : (
                                    <div className="text-center">
                                        <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <span className="text-xs font-medium text-slate-400">Image non disponible</span>
                                    </div>
                                  )}
                              </div>

                              <div className="flex justify-between items-center mt-3 text-slate-500 max-w-[400px]">
                                  <div className="group flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors">
                                      <div className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10"><MessageSquare className="w-4 h-4" /></div>
                                      <span className="text-xs">12</span>
                                  </div>
                                  <div className="group flex items-center gap-1.5 hover:text-[#00ba7c] transition-colors">
                                      <div className="p-1.5 rounded-full group-hover:bg-[#00ba7c]/10"><Repeat className="w-4 h-4" /></div>
                                      <span className="text-xs">4</span>
                                  </div>
                                  <div className="group flex items-center gap-1.5 hover:text-[#f91880] transition-colors">
                                      <div className="p-1.5 rounded-full group-hover:bg-[#f91880]/10"><Heart className="w-4 h-4" /></div>
                                      <span className="text-xs">84</span>
                                  </div>
                                  <div className="group flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors">
                                      <div className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10"><Share className="w-4 h-4" /></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
             )}

             {/* Action Bar for Multicasting - DYNAMIC BASED ON TAB */}
             <div className="mt-10 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-4 px-2">
                   <Rocket className="w-5 h-5 text-blue-600" />
                   <h3 className="font-bold text-slate-800">
                     {currentAd?.channel === 'LinkedIn' ? "Publier sur LinkedIn" : 
                      currentAd?.channel === 'Social' ? "Publier sur les Réseaux" : "Diffuser sur les Jobboards"}
                   </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {/* SHOW FOR LINKEDIN OR DEFAULT */}
                   {currentAd?.channel === 'LinkedIn' && (
                     <button 
                       onClick={() => copyAndOpen('https://www.linkedin.com/post/new', currentAd.content, 'LinkedIn')}
                       className="sm:col-span-3 group bg-[#0a66c2] text-white p-4 rounded-xl border border-[#0a66c2] hover:bg-[#004182] hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
                     >
                       <Linkedin className="w-6 h-6" />
                       <span className="font-bold">Copier & Publier sur LinkedIn</span>
                       <ExternalLink className="w-4 h-4 ml-2" />
                     </button>
                   )}

                   {/* SHOW FOR SOCIAL */}
                   {currentAd?.channel === 'Social' && (
                      <>
                        <button 
                          onClick={() => copyAndOpen('https://twitter.com/compose/tweet', currentAd.content, 'X (Twitter)')}
                          className="group bg-black text-white p-4 rounded-xl border border-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <span className="font-bold text-lg">X</span>
                          <span className="font-bold">Copier & Poster sur X</span>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </button>
                        <button 
                          onClick={() => copyAndOpen('https://www.facebook.com/', currentAd.content, 'Facebook')}
                          className="group bg-[#1877F2] text-white p-4 rounded-xl border border-[#1877F2] hover:bg-[#1465d1] transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <span className="font-bold">Copier & Poster sur Facebook</span>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </button>
                      </>
                   )}

                   {/* SHOW FOR JOBBOARD (DEFAULT) */}
                   {currentAd?.channel === 'Jobboard' && (
                     <>
                       <button 
                         onClick={() => copyAndOpen('https://recruteur.hellowork.com/', currentAd.content, 'HelloWork')}
                         className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                       >
                         <div className="w-10 h-10 bg-[#E60000] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">HW</div>
                         <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 truncate">HelloWork</div>
                            <div className="text-xs text-slate-500">Copier & Publier</div>
                         </div>
                         <ExternalLink className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400 shrink-0" />
                       </button>

                       <button 
                         onClick={() => copyAndOpen('https://entreprise.francetravail.fr/', currentAd.content, 'France Travail')}
                         className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                       >
                         <div className="w-10 h-10 bg-[#162766] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">FT</div>
                         <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 truncate">France Travail</div>
                            <div className="text-xs text-slate-500">Copier & Publier</div>
                         </div>
                         <ExternalLink className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400 shrink-0" />
                       </button>

                       <button 
                         onClick={() => copyAndOpen('https://fr.indeed.com/recrutement', currentAd.content, 'Indeed')}
                         className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                       >
                         <div className="w-10 h-10 bg-[#003A9B] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">IN</div>
                         <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 truncate">Indeed</div>
                            <div className="text-xs text-slate-500">Copier & Publier</div>
                         </div>
                         <ExternalLink className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400 shrink-0" />
                       </button>
                     </>
                   )}
                </div>
             </div>
          </div>
        </>
      )}

      {/* 2. SOURCING VIEW */}
      {viewMode === 'SOURCING' && (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 space-y-10 font-sans">
            
            {/* EMAIL SECTION - GMAIL STYLE */}
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Email d'Approche Directe</h3>
               </div>
               
               <div className="bg-white rounded-t-xl shadow-2xl border border-slate-200 overflow-hidden ring-1 ring-black/5">
                  <div className="bg-[#f2f6fc] px-4 py-3 flex justify-between items-center border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-700">Nouveau message</span>
                      <div className="flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4 text-slate-500 cursor-pointer" />
                      </div>
                  </div>
                  
                  <div className="bg-white">
                      <div className="flex items-center px-4 py-2 border-b border-slate-100">
                          <span className="text-slate-500 text-sm w-16 font-medium">À</span>
                          <span className="text-slate-400 text-sm italic">candidat@email.com</span>
                      </div>
                      <div className="flex items-center px-4 py-2 border-b border-slate-100">
                          <span className="text-slate-500 text-sm w-16 font-medium">Objet</span>
                          <span className="text-slate-900 text-sm font-medium">
                            {fullResponse?.huntingEmail 
                                ? cleanText(fullResponse.huntingEmail).split('\n')[0].replace('Objet :', '').replace('Subject:', '').trim() 
                                : ""}
                          </span>
                      </div>
                      <div className="p-4 min-h-[300px] text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                          {fullResponse?.huntingEmail 
                            ? cleanText(fullResponse.huntingEmail).split('\n').slice(1).join('\n').trim() 
                            : <span className="text-slate-400 italic">Génération du message en cours...</span>}
                      </div>
                  </div>

                  <div className="px-4 py-3 bg-white border-t border-slate-100 flex justify-between items-center sticky bottom-0">
                      <div className="flex gap-2 items-center">
                          <button 
                            onClick={() => fullResponse?.huntingEmail && copyToClipboard(fullResponse.huntingEmail)}
                            className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0946a8] text-white font-medium rounded-full text-sm transition-colors shadow-sm flex items-center gap-2"
                          >
                             Envoyer
                          </button>
                          <div className="text-slate-400 mx-2">|</div>
                          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><span className="font-bold font-serif">A</span></button>
                          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><Paperclip className="w-4 h-4" /></button>
                      </div>
                      <button 
                        onClick={() => fullResponse?.huntingEmail && copyToClipboard(fullResponse.huntingEmail)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                        title="Copier le message"
                      >
                         <Copy className="w-4 h-4" />
                      </button>
                  </div>
               </div>
            </div>

            {/* BOOLEAN SEARCH SECTION */}
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-100">
               <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Requête Booléenne</h3>
               </div>
               <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden group relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-500"></div>
                  <div className="p-5 font-mono text-sm text-emerald-400 leading-relaxed break-all selection:bg-emerald-500/30">
                    <span className="text-slate-500 select-none">$ </span>
                    {fullResponse?.booleanSearch || "En attente..."}
                  </div>
                  <div className="bg-[#0f172a] px-4 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 flex justify-between items-center border-t border-slate-700">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Compatible LinkedIn Recruiter</span>
                      <button 
                        onClick={() => fullResponse?.booleanSearch && copyToClipboard(fullResponse.booleanSearch)}
                        className="text-white hover:text-indigo-400 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> COPIER
                      </button>
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* 3. INTERVIEW VIEW */}
      {viewMode === 'INTERVIEW' && (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 font-sans">
           <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 mb-6">
                 <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-bold text-blue-900 text-sm">Guide d'Entretien Structuré</h4>
                    <p className="text-sm text-blue-700 mt-1">Utilisez ces questions pour évaluer objectivement les candidats et réduire les biais.</p>
                 </div>
              </div>

              <div className="grid gap-4">
                {fullResponse?.interviewQuestions?.map((q, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`
                          px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                          ${q.category === 'Technique' ? 'bg-purple-100 text-purple-700' : 
                            q.category === 'Soft Skills' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                        `}>
                          {q.category}
                        </span>
                        <span className="text-slate-300 font-mono text-xs">#{idx + 1}</span>
                      </div>
                      
                      {/* Lien avec le poste */}
                      {q.linkedTo && (
                        <div className="mb-3 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                          🔗 Lié à : <span className="font-semibold">{cleanText(q.linkedTo)}</span>
                        </div>
                      )}
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-4 leading-snug">{cleanText(q.question)}</h3>
                      
                      {/* Critère d'évaluation */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative overflow-hidden mb-3">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                            <Target className="w-3.5 h-3.5" /> Critère d'évaluation
                        </div>
                        <p className="text-sm text-slate-700 italic leading-relaxed">{cleanText(q.evaluationCriteria)}</p>
                      </div>
                      
                      {/* Green & Red Flags */}
                      <div className="grid grid-cols-2 gap-3">
                        {q.greenFlags && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                            <div className="text-xs font-bold text-green-700 mb-1">✅ Bonne réponse</div>
                            <p className="text-xs text-green-800 leading-relaxed">{cleanText(q.greenFlags)}</p>
                          </div>
                        )}
                        {q.redFlags && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                            <div className="text-xs font-bold text-red-700 mb-1">🚩 Alerte</div>
                            <p className="text-xs text-red-800 leading-relaxed">{cleanText(q.redFlags)}</p>
                          </div>
                        )}
                      </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* SECTION ANALYSE & OUTILS AVANCÉS */}
      {fullResponse?.analysis && (
        <div className="space-y-6 mt-8">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Score SEO */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-green-800">Score SEO</span>
                <span className={`text-2xl font-bold ${fullResponse.analysis.seoScore >= 70 ? 'text-green-600' : fullResponse.analysis.seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {fullResponse.analysis.seoScore}/100
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${fullResponse.analysis.seoScore >= 70 ? 'bg-green-500' : fullResponse.analysis.seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${fullResponse.analysis.seoScore}%` }}
                ></div>
              </div>
            </div>

            {/* Score Attractivité */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-800">Score Attractivité</span>
                <span className={`text-2xl font-bold ${fullResponse.analysis.attractivenessScore >= 70 ? 'text-blue-600' : fullResponse.analysis.attractivenessScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {fullResponse.analysis.attractivenessScore}/100
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${fullResponse.analysis.attractivenessScore >= 70 ? 'bg-blue-500' : fullResponse.analysis.attractivenessScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${fullResponse.analysis.attractivenessScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Analyse Marché */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              📊 Analyse du Marché
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Salaire marché</p>
                <p className="text-lg font-bold text-slate-800">{fullResponse.analysis.marketSalary}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Position vs concurrence</p>
                <p className="text-sm text-slate-700">{fullResponse.analysis.competitorComparison}</p>
              </div>
            </div>
            
            {/* Suggestions d'amélioration */}
            {fullResponse.analysis.improvements && fullResponse.analysis.improvements.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm font-semibold text-amber-800 mb-2">💡 Suggestions d'amélioration :</p>
                <ul className="space-y-1">
                  {fullResponse.analysis.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500">•</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SMS & Script Vocal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SMS Template */}
            {fullResponse.smsTemplate && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    📱 Template SMS
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(fullResponse.smsTemplate || '')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600"
                  >
                    Copier
                  </button>
                </div>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{fullResponse.smsTemplate}</p>
                <p className="text-xs text-slate-400 mt-2">{fullResponse.smsTemplate?.length || 0}/160 caractères</p>
              </div>
            )}

            {/* Script Message Vocal */}
            {fullResponse.voicemailScript && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    🎙️ Script Message Vocal
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(fullResponse.voicemailScript || '')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600"
                  >
                    Copier
                  </button>
                </div>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg italic">"{fullResponse.voicemailScript}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIDDEN PDF TEMPLATE - AMELIORÉ */}
      <div id="export-container" style={{ display: 'none', padding: '40px', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1e293b', backgroundColor: 'white' }}>
        
        {/* PDF Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0066b3', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
             <h1 style={{fontSize: '22px', fontWeight: '800', margin: '0', color: '#1e293b'}}>
               <span style={{color: '#4a4a4a'}}>ADVANCE</span>
               <span style={{color: '#94a3b8', marginLeft: '5px'}}>EMPLOI</span>
               <span style={{color: '#0066b3', marginLeft: '5px'}}>06</span>
             </h1>
             <p style={{fontSize: '11px', color: '#64748b', marginTop: '5px'}}>by <span style={{color: '#0066b3', fontWeight: '600'}}>RecrutPro IA</span></p>
          </div>
          <div style={{textAlign: 'right'}}>
             <div style={{fontSize: '14px', fontWeight: 'bold'}}>{formData?.companyName}</div>
             <div style={{fontSize: '12px', color: '#64748b'}}>{new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
        
        {/* Job Title */}
        <div style={{backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '40px'}}>
           <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 10px 0'}}>{formData?.jobTitle}</h2>
           <div style={{display: 'flex', gap: '20px', fontSize: '12px', color: '#475569'}}>
              <span><strong>Contrat:</strong> {formData?.contractType}</span>
              <span><strong>Lieu:</strong> {formData?.location}</span>
              <span><strong>Secteur:</strong> {formData?.sector}</span>
           </div>
        </div>
        
        {/* Ads Content */}
        {currentAds?.map((ad, i) => (
           <div key={i} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066b3', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Version : {ad.channel}
              </h3>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '11px', lineHeight: '1.6', color: '#334155' }}>
                 {cleanText(ad.content)}
              </div>
           </div>
        ))}

        {/* Interview Questions */}
        {fullResponse?.interviewQuestions && (
          <div style={{ marginTop: '40px', pageBreakBefore: 'always' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px', borderBottom: '2px solid #0066b3', paddingBottom: '10px' }}>Guide d'entretien</h2>
            {fullResponse.interviewQuestions.map((q, i) => (
               <div key={i} style={{ marginBottom: '25px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0066b3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#0066b3', textTransform: 'uppercase' }}>{q.category}</span>
                    {q.linkedTo && <span style={{ fontSize: '10px', color: '#3b82f6' }}>🔗 {q.linkedTo}</span>}
                  </div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 10px 0', color: '#1e293b' }}>{i+1}. {q.question}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px 0' }}>🎯 <strong>Critère :</strong> {q.evaluationCriteria}</p>
                  {q.greenFlags && <p style={{ fontSize: '10px', color: '#16a34a', margin: '0 0 4px 0' }}>✅ <strong>Bonne réponse :</strong> {q.greenFlags}</p>}
                  {q.redFlags && <p style={{ fontSize: '10px', color: '#dc2626', margin: '0' }}>🚩 <strong>Alerte :</strong> {q.redFlags}</p>}
               </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
           Document généré par ADVANCE EMPLOI 06 — Propulsé par RecrutPro IA. Confidentiel.
        </div>
      </div>

    </div>
  );
};
