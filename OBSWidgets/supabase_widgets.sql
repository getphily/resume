-- Run this in your Supabase SQL Editor to create the table for saving widget configs

CREATE TABLE public.widget_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  config jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own configs
CREATE POLICY "Users can insert their own configs" ON public.widget_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own configs
CREATE POLICY "Users can read their own configs" ON public.widget_configs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Public can read configs (needed for OBS to read the URL without logging in!)
CREATE POLICY "Public can read widget configs" ON public.widget_configs
  FOR SELECT USING (true);

-- Policy: Users can update their own configs
CREATE POLICY "Users can update their own configs" ON public.widget_configs
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own configs
CREATE POLICY "Users can delete their own configs" ON public.widget_configs
  FOR DELETE USING (auth.uid() = user_id);
