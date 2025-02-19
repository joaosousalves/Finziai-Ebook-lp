/*
  # Create Lead Capture Table

  1. New Tables
    - `lead_capture`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `age_range` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `lead_capture` table
    - Add policy for inserting new leads
    - Add policy for reading own data
*/

CREATE TABLE IF NOT EXISTS lead_capture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age_range text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_capture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
  ON lead_capture
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON lead_capture
  FOR SELECT
  TO authenticated
  USING (email = auth.email());