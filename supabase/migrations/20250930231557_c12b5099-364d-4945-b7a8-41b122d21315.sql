-- Create enum types
CREATE TYPE public.post_type AS ENUM ('assignment', 'detention-slip', 'pop-quiz', 'announcement');
CREATE TYPE public.evidence_type AS ENUM ('pdf', 'image', 'url');
CREATE TYPE public.severity_type AS ENUM ('info', 'alert', 'win');
CREATE TYPE public.entry_type AS ENUM ('post', 'doc', 'milestone');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  summary TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  hero_image TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type post_type NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  issue_refs UUID[] DEFAULT '{}',
  reactions JSONB DEFAULT '{"like": 0, "lol": 0, "angry": 0}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create evidence table
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file TEXT,
  external_url TEXT,
  caption TEXT NOT NULL,
  issue_ref UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  date_of_doc DATE NOT NULL,
  sensitivity TEXT CHECK (sensitivity IN ('low', 'med', 'high')),
  redacted BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  type evidence_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT,
  severity severity_type NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  results JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticker_quotes table
CREATE TABLE public.ticker_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  source_label TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create timeline table
CREATE TABLE public.timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_ref UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_type entry_type NOT NULL,
  ref_id UUID,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticker_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to auto-generate alias
CREATE OR REPLACE FUNCTION public.generate_alias()
RETURNS TEXT
LANGUAGE PLPGSQL
AS $$
DECLARE
  new_alias TEXT;
BEGIN
  new_alias := 'Student-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE alias = new_alias) LOOP
    new_alias := 'Student-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  RETURN new_alias;
END;
$$;

-- Create trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, alias)
  VALUES (NEW.id, public.generate_alias());
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles viewable by admins"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for issues
CREATE POLICY "Issues are viewable by everyone"
  ON public.issues FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage issues"
  ON public.issues FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for posts
CREATE POLICY "Approved posts viewable by everyone"
  ON public.posts FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for evidence
CREATE POLICY "Evidence viewable by everyone"
  ON public.evidence FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage evidence"
  ON public.evidence FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for banners
CREATE POLICY "Active banners viewable by everyone"
  ON public.banners FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage banners"
  ON public.banners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for polls
CREATE POLICY "Active polls viewable by everyone"
  ON public.polls FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage polls"
  ON public.polls FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ticker_quotes
CREATE POLICY "Approved quotes viewable by everyone"
  ON public.ticker_quotes FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage quotes"
  ON public.ticker_quotes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for timeline
CREATE POLICY "Timeline viewable by everyone"
  ON public.timeline FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage timeline"
  ON public.timeline FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));