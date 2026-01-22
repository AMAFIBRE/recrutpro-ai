import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface JobPost {
  id: string;
  created_at: string;
  job_title: string;
  company_name: string;
  location: string;
  contract_type: string;
  sector: string | null;
  salary_range: string | null;
  ad_content: string;
  ad_channel: string;
  views_count: number;
  is_active: boolean;
  slug: string;
}

export interface Application {
  id: string;
  created_at: string;
  job_post_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  status: 'new' | 'reviewed' | 'interview' | 'rejected' | 'hired';
}

// Générer un slug unique
export const generateSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// Publier une annonce
export const publishJobPost = async (data: {
  job_title: string;
  company_name: string;
  location: string;
  contract_type: string;
  sector?: string;
  salary_range?: string;
  ad_content: string;
  ad_channel?: string;
}): Promise<JobPost> => {
  const slug = generateSlug();
  
  const { data: jobPost, error } = await supabase
    .from('job_posts')
    .insert({
      ...data,
      slug,
      views_count: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return jobPost;
};

// Récupérer une annonce par slug
export const getJobPostBySlug = async (slug: string): Promise<JobPost | null> => {
  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  
  // Incrémenter le compteur de vues
  await supabase
    .from('job_posts')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', data.id);

  return data;
};

// Récupérer toutes les annonces
export const getAllJobPosts = async (): Promise<JobPost[]> => {
  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Soumettre une candidature
export const submitApplication = async (data: {
  job_post_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  cv_file?: File;
}): Promise<Application> => {
  let cv_url: string | null = null;
  let cv_filename: string | null = null;

  // Upload du CV si fourni
  if (data.cv_file) {
    const fileExt = data.cv_file.name.split('.').pop();
    const fileName = `${data.job_post_id}/${Date.now()}_${data.first_name}_${data.last_name}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, data.cv_file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName);
      cv_url = urlData.publicUrl;
      cv_filename = data.cv_file.name;
    }
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      job_post_id: data.job_post_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      cv_url,
      cv_filename,
      status: 'new'
    })
    .select()
    .single();

  if (error) throw error;
  return application;
};

// Récupérer les candidatures pour une annonce
export const getApplicationsForJob = async (jobPostId: string): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_post_id', jobPostId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Récupérer toutes les candidatures
export const getAllApplications = async (): Promise<(Application & { job_post?: JobPost })[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job_post:job_posts(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Mettre à jour le statut d'une candidature
export const updateApplicationStatus = async (
  applicationId: string, 
  status: Application['status']
): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId);

  if (error) throw error;
};
