-- Fix profile privacy - users should only see their own profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy - users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Optional: If you want to allow viewing display names publicly (for features like user lists)
-- you can create a separate policy for specific columns:
-- CREATE POLICY "Display names are publicly viewable" 
-- ON public.profiles 
-- FOR SELECT 
-- USING (true);