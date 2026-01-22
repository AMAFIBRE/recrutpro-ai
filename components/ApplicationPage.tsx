import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, Building2, Send, Loader2, CheckCircle, 
  AlertCircle, Upload, FileText, User, Mail, Phone, MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { getJobPostBySlug, submitApplication, JobPost } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';

interface Props {
  slug: string;
  onBack: () => void;
}

export const ApplicationPage: React.FC<Props> = ({ slug, onBack }) => {
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      const jobPost = await getJobPostBySlug(slug);
      if (jobPost) {
        setJob(jobPost);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    loadJob();
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 5 Mo)');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitApplication({
        job_post_id: job.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || undefined,
        message: message || undefined,
        cv_file: cvFile || undefined
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erreur candidature:', err);
      setError(err.message || 'Erreur lors de l\'envoi de votre candidature');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n').trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Annonce introuvable</h1>
          <p className="text-slate-600 mb-6">Cette offre d'emploi n'existe plus ou a été désactivée.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Candidature envoyée ! 🎉</h1>
          <p className="text-slate-600 mb-6">
            Merci {firstName} ! Votre candidature pour le poste de <strong>{job?.job_title}</strong> a bien été reçue.
            L'équipe de {job?.company_name} vous contactera si votre profil correspond.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-left">
            <p className="text-sm text-blue-800">
              <strong>Conseil :</strong> Suivez {job?.company_name} sur LinkedIn pour ne rien manquer de leurs actualités !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec logo entreprise */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600">
              {job?.company_name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-80">Offre d'emploi</p>
              <h1 className="text-2xl font-bold">{job?.company_name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Carte de l'offre */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Infos principales */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{job?.job_title}</h2>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                <Building2 className="w-4 h-4" /> {job?.company_name}
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                <MapPin className="w-4 h-4" /> {job?.location}
              </span>
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                <Briefcase className="w-4 h-4" /> {job?.contract_type}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6">
            <ReactMarkdown
              className="prose prose-slate max-w-none"
              components={{
                h1: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3" {...props} />,
                h2: ({node, ...props}) => <h4 className="text-base font-bold text-slate-800 mt-5 mb-2" {...props} />,
                h3: ({node, ...props}) => <h5 className="font-semibold text-slate-700 mt-4 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                li: ({node, ...props}) => (
                  <li className="flex items-start gap-2 text-slate-600">
                    <span className="text-blue-500 mt-1.5">•</span>
                    <span>{props.children}</span>
                  </li>
                ),
                p: ({node, ...props}) => <p className="text-slate-600 mb-4 leading-relaxed" {...props} />
              }}
            >
              {cleanText(job?.ad_content || '')}
            </ReactMarkdown>
          </div>
        </div>

        {/* Formulaire de candidature */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5" />
              Postuler maintenant
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Nom / Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-1" /> Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Dupont"
                />
              </div>
            </div>

            {/* Email / Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Mail className="w-4 h-4 inline mr-1" /> Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="jean.dupont@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1" /> Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <FileText className="w-4 h-4 inline mr-1" /> CV (PDF, max 5 Mo)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${cvFile ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600'}`}
                >
                  {cvFile ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {cvFile.name}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Cliquez pour joindre votre CV
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <MessageSquare className="w-4 h-4 inline mr-1" /> Message de motivation
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Présentez-vous en quelques lignes..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer ma candidature
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              En soumettant ce formulaire, vous acceptez que vos données soient traitées par {job?.company_name} dans le cadre de votre candidature.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Propulsé par <span className="font-semibold text-blue-600">RecrutPro AI</span> — ADVANCE EMPLOI 06</p>
        </div>
      </div>
    </div>
  );
};
