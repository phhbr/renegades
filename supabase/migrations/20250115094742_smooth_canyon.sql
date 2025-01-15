/*
  # Add priority field to sponsors table

  1. Changes
    - Add priority column to sponsors table with default value 0
    - Update existing sponsors to have sequential priorities
  
  2. Notes
    - Lower priority number means higher display priority (0 is highest)
    - Default value ensures backward compatibility
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsors' AND column_name = 'priority'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN priority integer DEFAULT 0;
  END IF;
END $$;