/*
  # Add press coverage table
  
  1. New Tables
    - `press_coverage`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `abstract` (text)
      - `image_url` (text)
      - `url` (text, required)
      - `media_outlet` (text, required)
      - `published_date` (date, required)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Public read access for active entries
    - Admin-only write access
*/

CREATE TABLE IF NOT EXISTS press_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  abstract text,
  image_url text,
  url text NOT NULL,
  media_outlet text NOT NULL,
  published_date date NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE press_coverage ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_press_coverage_updated_at
  BEFORE UPDATE ON press_coverage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
CREATE POLICY "Active press coverage is viewable by everyone"
  ON press_coverage
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Press coverage is manageable by admin users"
  ON press_coverage
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );