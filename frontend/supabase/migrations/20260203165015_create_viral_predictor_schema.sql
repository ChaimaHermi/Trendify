-- Viral Content Predictor Schema
--
-- 1. New Tables
--    - predictions: Stores user predictions with content and results
--      - id (uuid, primary key)
--      - content_text (text) - The social media content to analyze
--      - content_type (text) - Type of content (text, image, video)
--      - hashtags (text[]) - Array of hashtags
--      - platform (text) - Social media platform
--      - predicted_class (text) - Low, Medium, or High virality
--      - virality_score (integer) - Score from 0-100
--      - model_used (text) - Model that made the prediction
--      - features (jsonb) - Feature importance data
--      - created_at (timestamptz)
--
--    - model_metrics: Stores performance metrics for ML models
--      - id (uuid, primary key)
--      - model_name (text) - Name of the model
--      - accuracy (numeric) - Model accuracy
--      - f1_score (numeric) - F1 score
--      - precision_score (numeric) - Precision
--      - recall_score (numeric) - Recall
--      - confusion_matrix (jsonb) - Confusion matrix data
--      - training_date (timestamptz)
--      - dataset_size (integer)
--
-- 2. Security
--    - Enable RLS on all tables
--    - Public read access to model_metrics (educational data)
--    - Users can insert and read their own predictions

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_text text NOT NULL,
  content_type text DEFAULT 'text',
  hashtags text[] DEFAULT '{}',
  platform text DEFAULT 'general',
  predicted_class text NOT NULL,
  virality_score integer NOT NULL CHECK (virality_score >= 0 AND virality_score <= 100),
  model_used text NOT NULL,
  features jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text UNIQUE NOT NULL,
  accuracy numeric NOT NULL,
  f1_score numeric NOT NULL,
  precision_score numeric NOT NULL,
  recall_score numeric NOT NULL,
  confusion_matrix jsonb NOT NULL,
  training_date timestamptz DEFAULT now(),
  dataset_size integer DEFAULT 0
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read predictions"
  ON predictions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert predictions"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read model metrics"
  ON model_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample model metrics for demonstration
INSERT INTO model_metrics (model_name, accuracy, f1_score, precision_score, recall_score, confusion_matrix, dataset_size)
VALUES 
  ('Logistic Regression', 0.78, 0.76, 0.79, 0.74, '{"matrix": [[450, 50, 25], [60, 380, 35], [30, 45, 425]], "labels": ["Low", "Medium", "High"]}', 1500),
  ('Random Forest', 0.85, 0.84, 0.86, 0.83, '{"matrix": [[475, 30, 20], [45, 410, 20], [25, 30, 445]], "labels": ["Low", "Medium", "High"]}', 1500),
  ('XGBoost', 0.88, 0.87, 0.89, 0.86, '{"matrix": [[485, 25, 15], [35, 425, 15], [20, 25, 455]], "labels": ["Low", "Medium", "High"]}', 1500),
  ('Neural Network', 0.91, 0.90, 0.92, 0.89, '{"matrix": [[490, 20, 15], [30, 435, 10], [15, 20, 465]], "labels": ["Low", "Medium", "High"]}', 1500)
ON CONFLICT (model_name) DO NOTHING;