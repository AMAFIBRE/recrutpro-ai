import React, { useState } from 'react';
import { X, Link, Copy, Check, Rocket, ExternalLink, Loader2, Share2 } from 'lucide-react';
import { publishJobPost, JobPost } from '../services/supabaseClient';
import { JobFormData, GeneratedAd } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: JobFormData;
  ad: GeneratedAd;
}

export const PublishModal: React.FC<Props> = ({ isOpen, onClose, formData, ad }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedJob, setPublishedJob] = useState<JobPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      const job = await publishJobPost({
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        location: formData.location,
        contract_type: formData.contractType,
        sector: formData.sector,
        salary_range: formData.salaryRange,
        ad_content: ad.content,
        ad_channel: ad.channel
      });
      setPublishedJob(job);
    } catch (err: any) {
      console.error('Erreur publication:', err);
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setIsPublishing(false);
    }
  };

  const getPublicUrl = () => {
    if (!publishedJob) return '';
    // L'URL sera sur le même domaine que l'app
    const baseUrl = window.location.origin;
    return `${baseUrl}/postuler/${publishedJob.slug}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getPublicUrl());
    const text = encodeURIComponent(`🚀 Nous recrutons ! ${formData.jobTitle} - ${formData.location}\n\nPostulez maintenant :`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <Rocket className="w-6 h-6" />
            <h2 className="text-lg font-bold">Publier l'annonce</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!publishedJob ? (
            // État : Pas encore publié
            <>
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-slate-900 mb-1">{formData.jobTitle}</h3>
                <p className="text-sm text-slate-600">{formData.companyName} • {formData.location}</p>
                <p className="text-xs text-slate-500 mt-2">{formData.contractType} • {ad.channel}</p>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                En publiant cette annonce, vous obtiendrez un <strong>lien unique</strong> que vous pourrez partager. 
                Les candidats pourront postuler directement et vous recevrez leurs candidatures dans votre dashboard.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publication en cours...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Publier et obtenir le lien
                  </>
                )}
              </button>
            </>
          ) : (
            // État : Publié avec succès
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Annonce publiée ! 🎉</h3>
                <p className="text-slate-600">Partagez ce lien pour recevoir des candidatures</p>
              </div>

              {/* Lien à copier */}
              <div className="bg-slate-100 rounded-xl p-4 mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                  Lien de candidature
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-slate-200 flex items-center gap-2 overflow-hidden">
                    <Link className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{getPublicUrl()}</span>
                  </div>
                  <button
                    onClick={copyLink}
                    className={`shrink-0 p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Actions de partage */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copié !' : 'Copier'}
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-xl transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  LinkedIn
                </button>
              </div>

              <a
                href={getPublicUrl()}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Voir la page de candidature
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
