
-- Restrict overly-permissive SELECT policies

-- profiles: only self or admin can read
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::app_role));

-- teachers: only admin or teacher can read
DROP POLICY IF EXISTS "Teachers readable" ON public.teachers;
DROP POLICY IF EXISTS "Teachers viewable by authenticated" ON public.teachers;
CREATE POLICY "Staff view teachers"
  ON public.teachers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'teacher'::app_role));

-- students: only admin or teacher can read
DROP POLICY IF EXISTS "Students readable" ON public.students;
DROP POLICY IF EXISTS "Students viewable by authenticated" ON public.students;
CREATE POLICY "Staff view students"
  ON public.students FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'teacher'::app_role));

-- grades: only admin or teacher can read
DROP POLICY IF EXISTS "Grades readable" ON public.grades;
CREATE POLICY "Staff view grades"
  ON public.grades FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'teacher'::app_role));
