/*
  # Team Members and Sponsors Schema

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `image_url` (text)
      - `number` (text, nullable)
      - `position` (text, nullable)
      - `member_type` (text) - either 'staff' or 'player'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `sponsors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `logo_url` (text)
      - `description` (text)
      - `website` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Public read access for active sponsors
      - Public read access for team members
      - Authenticated admin users can manage both tables
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  image_url text,
  number text,
  position text,
  member_type text NOT NULL CHECK (member_type IN ('staff', 'player')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  description text,
  website text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies for team_members
CREATE POLICY "Team members are viewable by everyone"
  ON team_members
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Team members are manageable by admin users"
  ON team_members
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for sponsors
CREATE POLICY "Active sponsors are viewable by everyone"
  ON sponsors
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Sponsors are manageable by admin users"
  ON sponsors
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Insert initial data
INSERT INTO team_members (name, role, image_url, member_type)
VALUES
  ('John Smith', 'Head Coach', '/assets/team/coach-1.jpg', 'staff'),
  ('Sarah Johnson', 'Offensive Coordinator', '/assets/team/coach-2.jpg', 'staff'),
  ('Mike Williams', 'Defensive Coordinator', '/assets/team/coach-3.jpg', 'staff');

INSERT INTO team_members (name, position, number, image_url, member_type)
VALUES
  ('Tom Wilson', 'Quarterback', '12', '/assets/team/player-1.jpg', 'player'),
  ('James Brown', 'Wide Receiver', '84', '/assets/team/player-2.jpg', 'player');

INSERT INTO sponsors (name, logo_url, description, website, active)
VALUES
  ('SportGear Pro', '/assets/sponsors/sponsor-1.png', 'Leading provider of professional sports equipment.', 'https://example.com/sportgear', true),
  ('HealthPlus', '/assets/sponsors/sponsor-2.png', 'Your partner in sports nutrition and health supplements.', 'https://example.com/healthplus', true),
  ('City Fitness', '/assets/sponsors/sponsor-3.png', 'Premier fitness center with state-of-the-art facilities.', 'https://example.com/cityfitness', true);