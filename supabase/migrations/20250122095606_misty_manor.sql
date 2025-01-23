/*
  # Replace press_coverage with media_coverage table

  1. Changes
    - Drop press_coverage table
    - Create new media_coverage table with identical structure
    - Set up RLS policies for the new table

  2. Security
    - Enable RLS on media_coverage table
    - Public read access for active entries
    - Admin-only write access
*/

-- Drop the old table
DROP TABLE IF EXISTS press_coverage;

-- Create the new table
CREATE TABLE IF NOT EXISTS media_coverage (
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
ALTER TABLE media_coverage ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_media_coverage_updated_at
  BEFORE UPDATE ON media_coverage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
CREATE POLICY "Active media coverage is viewable by everyone"
  ON media_coverage
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Media coverage is manageable by admin users"
  ON media_coverage
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );