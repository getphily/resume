-- Add Update and Delete policies for widget_configs
CREATE POLICY "Users can update their own configs" ON public.widget_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configs" ON public.widget_configs
  FOR DELETE USING (auth.uid() = user_id);
