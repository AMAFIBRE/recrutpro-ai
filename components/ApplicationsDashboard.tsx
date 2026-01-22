import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Eye, Clock, Mail, Phone, FileText, 
  ChevronDown, ChevronRight, ExternalLink, Loader2, RefreshCw,
  CheckCircle, XCircle, Calendar, User, MessageSquare, Download,
  ArrowLeft, Inbox, Filter, Search
} from 'lucide-react';
import { 
  getAllJobPosts, 
  getAllApplications, 
  updateApplicationStatus,
  JobPost, 
  Application 
} from '../services/supabaseClient';

interface Props {
  onBack: () => void;
}

const STATUS_CONFIG = {
  new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700', icon: Inbox },
  reviewed: { label: 'Vu', color: 'bg-slate-100 text-slate-700', icon: Eye },
  interview: { label: 'Entretien', color: 'bg-purple-100 text-purple-700', icon: Calendar },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: XCircle },
  hired: { label: 'Embauché', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export const ApplicationsDashboard: React.FC<Props> = ({ onBack }) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<(Application & { job_post?: JobPost })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, appsData] = await Promise.all([
        getAllJobPosts(),
        getAllApplications()
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: Application['status']) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications(apps => 
        apps.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesJob = !selectedJob || app.job_post_id === selectedJob;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJob && matchesStatus && matchesSearch;
  });

  const getJobApplicationsCount = (jobId: string) => 
    applications.filter(app => app.job_post_id === jobId).length;

  const getNewApplicationsCount = (jobId?: string) => 
    applications.filter(app => 
      app.status === 'new' && (!jobId || app.job_post_id === jobId)
    ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Candidatures
                </h1>
                <p className="text-sm text-slate-500">
                  {applications.length} candidature{applications.length > 1 ? 's' : ''} • 
                  {getNewApplicationsCount()} nouvelle{getNewApplicationsCount() > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Liste des annonces */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  Mes annonces
                </h2>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Toutes les candidatures */}
                <button
                  onClick={() => setSelectedJob(null)}
                  className={`w-full p-3 text-left border-b border-slate-50 transition-colors flex items-center justify-between ${!selectedJob ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <span className={`font-medium ${!selectedJob ? 'text-blue-700' : 'text-slate-700'}`}>
                    Toutes les candidatures
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${!selectedJob ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                    {applications.length}
                  </span>
                </button>

                {/* Liste des jobs */}
                {jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job.id)}
                    className={`w-full p-3 text-left border-b border-slate-50 transition-colors ${selectedJob === job.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${selectedJob === job.id ? 'text-blue-700' : 'text-slate-800'}`}>
                          {job.job_title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{job.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedJob === job.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                          {getJobApplicationsCount(job.id)}
                        </span>
                        {getNewApplicationsCount(job.id) > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                            {getNewApplicationsCount(job.id)} new
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {jobs.length === 0 && (
                  <div className="p-6 text-center text-slate-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune annonce publiée</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content - Liste des candidatures */}
          <div className="lg:col-span-3">
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Recherche */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                {/* Filtre statut */}
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="new">Nouveaux</option>
                    <option value="reviewed">Vus</option>
                    <option value="interview">Entretien</option>
                    <option value="hired">Embauchés</option>
                    <option value="rejected">Refusés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des candidatures */}
            <div className="space-y-3">
              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-700 mb-1">Aucune candidature</h3>
                  <p className="text-slate-500">Les candidatures apparaîtront ici</p>
                </div>
              ) : (
                filteredApplications.map(app => {
                  const statusConfig = STATUS_CONFIG[app.status];
                  const isExpanded = expandedApp === app.id;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                      {/* Header de la candidature */}
                      <button
                        onClick={() => {
                          setExpandedApp(isExpanded ? null : app.id);
                          if (app.status === 'new') {
                            handleStatusChange(app.id, 'reviewed');
                          }
                        }}
                        className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                            {app.first_name[0]}{app.last_name[0]}
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">
                                {app.first_name} {app.last_name}
                              </h3>
                              {app.status === 'new' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white uppercase">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 truncate">
                              {(app as any).job_post?.job_title || 'Poste inconnu'} • {app.email}
                            </p>
                          </div>

                          {/* Statut & Date */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-slate-400 hidden sm:block">
                              {new Date(app.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Détails expandés */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            {/* Contact */}
                            <div className="space-y-2">
                              <a 
                                href={`mailto:${app.email}`}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                              >
                                <Mail className="w-4 h-4" /> {app.email}
                              </a>
                              {app.phone && (
                                <a 
                                  href={`tel:${app.phone}`}
                                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                                >
                                  <Phone className="w-4 h-4" /> {app.phone}
                                </a>
                              )}
                              {app.cv_url && (
                                <a 
                                  href={app.cv_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  <FileText className="w-4 h-4" /> 
                                  Télécharger le CV
                                  <Download className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            {/* Message */}
                            {app.message && (
                              <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> Message
                                </p>
                                <p className="text-sm text-slate-700">{app.message}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500 mr-2 self-center">Changer le statut :</span>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                              const Icon = config.icon;
                              return (
                                <button
                                  key={key}
                                  onClick={() => handleStatusChange(app.id, key as Application['status'])}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                                    ${app.status === key 
                                      ? config.color + ' ring-2 ring-offset-1 ring-slate-300' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                  <Icon className="w-3 h-3" />
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
