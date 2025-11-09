-- Create enum types
CREATE TYPE public.app_role AS ENUM ('md', 'dept_head', 'hr', 'accounts', 'employee');
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'blocked', 'completed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geo_fence_radius INTEGER DEFAULT 300,
  pf_enabled BOOLEAN DEFAULT false,
  pf_percentage DECIMAL(5, 2) DEFAULT 12.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.departments(id),
  branch_id UUID REFERENCES public.branches(id),
  head_employee_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  branch_id UUID REFERENCES public.branches(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  designation TEXT,
  status public.employee_status DEFAULT 'active',
  pf_applicable BOOLEAN DEFAULT false,
  base_salary DECIMAL(10, 2),
  date_joined DATE DEFAULT CURRENT_DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  assigned_to UUID REFERENCES public.employees(id),
  origin_branch_id UUID REFERENCES public.branches(id),
  destination_branch_id UUID REFERENCES public.branches(id),
  status public.task_status DEFAULT 'todo',
  priority public.task_priority DEFAULT 'medium',
  travel_required BOOLEAN DEFAULT false,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  progress_percentage INTEGER DEFAULT 0,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance records
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id) NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance_from_branch INTEGER,
  status TEXT,
  worked_hours DECIMAL(5, 2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Advance salary requests
CREATE TABLE public.advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  repayment_months INTEGER DEFAULT 1,
  status public.approval_status DEFAULT 'pending',
  approved_by_dept_head UUID REFERENCES auth.users(id),
  approved_by_hr UUID REFERENCES auth.users(id),
  approved_by_md UUID REFERENCES auth.users(id),
  approved_by_accounts UUID REFERENCES auth.users(id),
  disbursed_at TIMESTAMPTZ,
  remaining_balance DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for branches (read-only for all authenticated)
CREATE POLICY "Branches viewable by authenticated users"
  ON public.branches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Branches manageable by MD and HR"
  ON public.branches FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'md') OR public.has_role(auth.uid(), 'hr'));

-- RLS Policies for departments
CREATE POLICY "Departments viewable by authenticated users"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Departments manageable by MD and dept heads"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'md') OR public.has_role(auth.uid(), 'dept_head') OR public.has_role(auth.uid(), 'hr'));

-- RLS Policies for employees
CREATE POLICY "Employees viewable by authenticated users"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees manageable by HR and MD"
  ON public.employees FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'md') OR public.has_role(auth.uid(), 'hr'));

-- RLS Policies for user_roles
CREATE POLICY "User roles viewable by authenticated users"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "User roles manageable by MD only"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'md'));

-- RLS Policies for tasks
CREATE POLICY "Tasks viewable by authenticated users"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tasks manageable by dept heads, HR, and MD"
  ON public.tasks FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'md') OR 
    public.has_role(auth.uid(), 'dept_head') OR 
    public.has_role(auth.uid(), 'hr')
  );

-- RLS Policies for attendance
CREATE POLICY "Attendance viewable by all authenticated"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Attendance insertable by employees"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Attendance manageable by HR and MD"
  ON public.attendance FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'md') OR public.has_role(auth.uid(), 'hr'));

-- RLS Policies for advances
CREATE POLICY "Advances viewable by authenticated users"
  ON public.advances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Advances creatable by employees"
  ON public.advances FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Advances manageable by approvers"
  ON public.advances FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'md') OR 
    public.has_role(auth.uid(), 'dept_head') OR 
    public.has_role(auth.uid(), 'hr') OR 
    public.has_role(auth.uid(), 'accounts')
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advances_updated_at BEFORE UPDATE ON public.advances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();