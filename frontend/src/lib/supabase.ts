import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export interface Prediction {
  id: string;
  content_text: string;
  content_type: string;
  hashtags: string[];
  platform: string;
  predicted_class: string;
  virality_score: number;
  model_used: string;
  features: Record<string, number>;
  created_at: string;
}


export interface ModelMetrics {
  id: string;
  model_name: string;
  accuracy: number;
  f1_score: number;
  precision_score: number;
  recall_score: number;
  confusion_matrix: {
    matrix: number[][];
    labels: string[];
  };
  training_date: string;
  dataset_size: number;
}



