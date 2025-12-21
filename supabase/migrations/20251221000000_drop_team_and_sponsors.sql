/*
  # Drop Team Members and Sponsors Tables

  1. Removed Tables
    - `team_members` - Now stored in local JSON file
    - `sponsors` - Now stored in local JSON file

  2. Removed Objects
    - Drop all triggers for updated_at
    - Drop RLS policies
    - Drop tables and function

  3. Reason
    - Team members and sponsors data migrated to JSON files in assets
    - Reduces database overhead and improves performance
*/

-- Drop RLS Policies
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON team_members;
DROP POLICY IF EXISTS "Team members are manageable by admin users" ON team_members;
DROP POLICY IF EXISTS "Active sponsors are viewable by everyone" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are manageable by admin users" ON sponsors;

-- Drop Triggers
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
DROP TRIGGER IF EXISTS update_sponsors_updated_at ON sponsors;

-- Drop Tables
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS sponsors;

-- Drop Function (only if no other tables use it)
DROP FUNCTION IF EXISTS update_updated_at();
