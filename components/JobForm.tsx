import React, { useState } from 'react';
import { JobFormData, ContractType } from '../types';
import { CONTRACT_OPTIONS, TONE_OPTIONS, SECTOR_SUGGESTIONS, INTERIM_BENEFITS, COMMON_BENEFITS, EXPERIENCE_OPTIONS } from '../constants';
import { Wand2, Loader2, MapPin, Building2, Euro, FileText, Sparkles, ChevronDown, CheckCircle2, Briefcase, Star, Gift, HelpCircle } from 'lucide-react';
import { suggestJobDetails } from '../services/geminiService';

interface JobFormProps {
  formData: JobFormData;
  setFormData: React.Dispatch<React.SetStateAction<JobFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, checked } = e.target;
     setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleInterimBenefit = (benefit: string) => {
    setFormData(prev => {
      const current = prev.interimBenefits || [];
      if (current.includes(benefit)) {
        return { ...prev, interimBenefits: current.filter(b => b !== benefit) };
      } else {
        return { ...prev, interimBenefits: [...current, benefit] };
      }
    });
  };

  const toggleBenefit = (benefit: string) => {
    setFormData(prev => {
      const current = prev.benefits || [];
      if (current.includes(benefit)) {
        return { ...prev, benefits: current.filter(b => b !== benefit) };
      } else {
        return { ...prev, benefits: [...current, benefit] };
      }
    });
  };

  const handleAutoFill = async () => {
    if (!formData.jobTitle) {
      setAutoFillError("Entrez d'abord un titre.");
      return;
    }
    
    setIsAutoFilling(true);
    setAutoFillError(null);
    try {
      const suggestions = await suggestJobDetails(formData.jobTitle);
      setFormData(prev => ({ ...prev, ...suggestions }));
    } catch (error) {
      console.error(error);
      setAutoFillError("Erreur réseau.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const inputClasses = "w-full rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm py-2.5 px-3 shadow-sm font-medium text-slate-800 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative ring-1 ring-slate-100">
      
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Configuration du Poste
        </h2>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">ÉTAPE 1</span>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Job Title */}
        <div className="space-y-1">
            <label className={labelClasses}>Intitulé du poste <span className="text-red-500">*</span></label>
            <div className="flex gap-2 relative">
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Ex: Chef de projet Digital"
                className={`${inputClasses} pl-3 font-semibold text-base`}
              />
              <button
                onClick={handleAutoFill}
                disabled={isAutoFilling || !formData.jobTitle}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-white border border-blue-100 hover:border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md px-3 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                {isAutoFilling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Auto-fill IA</span>
              </button>
            </div>
            {autoFillError && <p className="text-xs text-red-500 font-medium ml-1">{autoFillError}</p>}
        </div>

        {/* Company & Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div>
            <label className={labelClasses}>Entreprise</label>
            <div className="relative">
               <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
               <input
                 type="text"
                 name="companyName"
                 value={formData.companyName}
                 onChange={handleChange}
                 disabled={formData.isConfidential}
                 placeholder="Nom de l'entreprise"
                 className={`${inputClasses} pl-9 disabled:opacity-60`}
               />
            </div>
            <div className="mt-2 flex items-center">
                 <input
                    id="isConfidential"
                    name="isConfidential"
                    type="checkbox"
                    checked={formData.isConfidential}
                    onChange={handleCheckboxChange}
                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                 <label htmlFor="isConfidential" className="ml-2 text-xs text-slate-500 font-medium cursor-pointer">Mode Confidentiel</label>
            </div>
          </div>
          <div>
            <label className={labelClasses}>Secteur</label>
            <input
              list="sectors"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="Ex: Tech, Retail..."
              className={inputClasses}
            />
            <datalist id="sectors">{SECTOR_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
          </div>
        </div>

        {/* Contract & Experience & Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClasses}>Contrat</label>
            <div className="relative">
              <select name="contractType" 
                  // @ts-ignore
                  value={formData.contractType} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                {CONTRACT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Expérience</label>
            <div className="relative">
              <select name="experienceLevel" 
                  value={formData.experienceLevel} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
             <label className={labelClasses}>Ville</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Paris" className={`${inputClasses} pl-9`} />
              </div>
          </div>
        </div>
        
        {/* INTERIM SPECIFIC SECTION - VISIBLE SEULEMENT SI INTERIM */}
        {formData.contractType === ContractType.INTERIM && (
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
            <label className={`${labelClasses} text-blue-800 flex items-center gap-2`}>
              Avantages Intérim (Inclus)
              <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[9px]">Automatique</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTERIM_BENEFITS.map((benefit) => {
                const isSelected = formData.interimBenefits?.includes(benefit);
                return (
                  <button
                    key={benefit}
                    onClick={() => toggleInterimBenefit(benefit)}
                    className={`
                      text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5
                      ${isSelected 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}
                    `}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    {benefit}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* COMMON BENEFITS SECTION - MASQUÉ SI FREELANCE */}
        {formData.contractType !== ContractType.FREELANCE && (
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 animate-in fade-in">
             <div className="flex justify-between items-center">
                <label className={`${labelClasses} text-emerald-800`}>Avantages Entreprise</label>
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-100/50 px-2 py-0.5 rounded-full">Optionnel</span>
             </div>
             <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_BENEFITS.map((benefit) => {
                  const isSelected = formData.benefits?.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      onClick={() => toggleBenefit(benefit)}
                      className={`
                        text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5
                        ${isSelected 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}
                      `}
                    >
                      {isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Gift className="w-3 h-3 text-emerald-400" />}
                      {benefit}
                    </button>
                  )
                })}
             </div>
          </div>
        )}

        {/* Salary */}
        <div>
          <label className={labelClasses}>Salaire / TJM</label>
          <div className="relative">
             <Euro className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
             <input
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder={formData.contractType === ContractType.FREELANCE ? "Ex: 450€/jour" : "Ex: 35-45k€ annuel ou 2500€/mois"}
              className={`${inputClasses} pl-9`}
            />
          </div>
          {formData.contractType === ContractType.FREELANCE && (
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Indiquez le Taux Journalier Moyen (TJM) ou le budget total pour la mission.</p>
          )}
        </div>

        {/* Description & Skills */}
        <div className="space-y-4">
           <div>
              <div className="flex justify-between items-center mb-1">
                 <label className={labelClasses}>Missions clés</label>
                 <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-2.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl hidden group-hover:block z-10 font-normal leading-relaxed">
                        Listez 3 à 5 tâches principales. L'IA reformulera le tout. Vous pouvez copier-coller une fiche de poste brute.
                        <div className="absolute -bottom-1 right-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                 </div>
              </div>
              <div className="relative">
                 <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                 <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ex: \n- Gestion de projet\n- Encadrement équipe 5 pers.\n- Reporting client..."
                  className={`${inputClasses} pl-9 resize-none`}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                 <span className="font-bold text-blue-600">Astuce :</span> Soyez concis, l'IA se charge de la rédaction ("copywriting").
              </p>
           </div>
           
           <div>
              <div className="flex justify-between items-center mb-1">
                 <label className={labelClasses}>Profil & Compétences</label>
                 <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">Mots-clés</span>
              </div>
              <div className="relative">
                <Star className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ex: Habilitation B1V, Rigueur, Esprit d'équipe, Anglais B2..."
                  className={`${inputClasses} pl-9 resize-none`}
                />
              </div>
               <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                 Mélangez compétences techniques (Hard Skills) et savoir-être (Soft Skills).
              </p>
           </div>
        </div>

        {/* Tone Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label className={labelClasses}>Ton de communication</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {TONE_OPTIONS.map((t) => (
              <label key={t} className={`
                cursor-pointer rounded-lg p-2 text-[11px] font-bold text-center transition-all border
                ${formData.tone === t 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600'}
              `}>
                <input type="radio" name="tone" value={t} checked={formData.tone === t} onChange={handleChange} className="sr-only" />
                {t.split('&')[0]}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onSubmit}
            disabled={isLoading || !formData.jobTitle}
            className={`
              w-full group relative flex items-center justify-center py-4 px-4 rounded-xl text-white font-display font-bold text-lg tracking-wide transition-all
              ${isLoading || !formData.jobTitle 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> Rédaction...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                Générer le Kit Recrutement
              </span>
            )}
          </button>
        </div>
      </div>
      
      {isAutoFilling && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-blue-100 flex items-center gap-4 animate-bounce-slight">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20"></div>
                <Loader2 className="animate-spin text-blue-600 w-8 h-8 relative z-10" />
             </div>
             <div>
                <p className="text-blue-900 font-bold text-sm">Analyse du marché...</p>
                <p className="text-blue-600 text-xs">Recherche des compétences clés</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
