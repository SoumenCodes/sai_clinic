-- ==============================================================================
-- MULTI-TENANT CLINIC APPOINTMENT & SCHEDULE DATABASE SCHEMA FOR SUPABASE
-- Compatible with all Supabase / PostgreSQL versions (Uses native gen_random_uuid())
-- ==============================================================================

-- 1. CREATE TABLES (Idempotent & Ordered)
-- ------------------------------------------------------------------------------

-- Clinics Tenant Table
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- e.g. 'sai-homoeo-baridih'
    name TEXT NOT NULL,
    doctor_name TEXT,
    doctor_qualification TEXT,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    address TEXT NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinic Schedules Table (Shift Timings per day of week: 0=Sun, 1=Mon, ..., 6=Sat)
CREATE TABLE IF NOT EXISTS public.clinic_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    shift_1_start TIME NOT NULL DEFAULT '10:00:00',
    shift_1_end TIME NOT NULL DEFAULT '14:00:00',
    shift_2_start TIME DEFAULT '17:00:00',
    shift_2_end TIME DEFAULT '22:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(clinic_id, day_of_week)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL, -- MANDATORY
    patient_age INTEGER,
    problem TEXT,
    appointment_date DATE NOT NULL,
    slot_start_time TIME NOT NULL, -- e.g. '10:15:00'
    slot_end_time TIME NOT NULL,   -- e.g. '10:30:00'
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'completed', 'cancelled')) DEFAULT 'confirmed',
    consultation_mode TEXT NOT NULL DEFAULT 'in-clinic', -- 'in-clinic' or 'online'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevents double booking at the database level
    CONSTRAINT unique_slot_per_clinic UNIQUE(clinic_id, appointment_date, slot_start_time)
);

-- Blocked Slots Table (Doctor leave, emergency closures, holidays)
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    block_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient Medical Records & Prescription History Table
CREATE TABLE IF NOT EXISTS public.patient_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_phone TEXT NOT NULL, -- Key identifier for patient history
    patient_name TEXT NOT NULL,
    patient_age INTEGER,
    checkup_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    prescription_text TEXT,
    prescription_images TEXT[], -- Array of image URLs / compressed Base64 data URIs
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CREATE PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_schedules_clinic_day ON public.clinic_schedules(clinic_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_blocked_clinic_date ON public.blocked_slots(clinic_id, block_date);
CREATE INDEX IF NOT EXISTS idx_patient_records_phone ON public.patient_records(clinic_id, patient_phone);
CREATE INDEX IF NOT EXISTS idx_patient_records_date ON public.patient_records(clinic_id, checkup_date);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;

-- 4. CLEAN UP EXISTING POLICIES (Makes script safe to run multiple times)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read clinics" ON public.clinics;
DROP POLICY IF EXISTS "Allow public update clinics" ON public.clinics;
DROP POLICY IF EXISTS "Allow public read schedules" ON public.clinic_schedules;
DROP POLICY IF EXISTS "Allow public update schedules" ON public.clinic_schedules;
DROP POLICY IF EXISTS "Allow public insert schedules" ON public.clinic_schedules;
DROP POLICY IF EXISTS "Allow public read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public all blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Allow public read patient_records" ON public.patient_records;
DROP POLICY IF EXISTS "Allow public insert patient_records" ON public.patient_records;
DROP POLICY IF EXISTS "Allow public update patient_records" ON public.patient_records;
DROP POLICY IF EXISTS "Allow public delete patient_records" ON public.patient_records;

-- 5. DEFINE POLICIES
-- ------------------------------------------------------------------------------
-- Clinics Policies
CREATE POLICY "Allow public read clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Allow public update clinics" ON public.clinics FOR UPDATE USING (true) WITH CHECK (true);

-- Schedules Policies
CREATE POLICY "Allow public read schedules" ON public.clinic_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert schedules" ON public.clinic_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update schedules" ON public.clinic_schedules FOR UPDATE USING (true) WITH CHECK (true);

-- Appointments Policies
CREATE POLICY "Allow public read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update appointments" ON public.appointments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete appointments" ON public.appointments FOR DELETE USING (true);

-- Blocked Slots Policies
CREATE POLICY "Allow public all blocked_slots" ON public.blocked_slots FOR ALL USING (true) WITH CHECK (true);

-- Patient Medical Records Policies
CREATE POLICY "Allow public read patient_records" ON public.patient_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert patient_records" ON public.patient_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update patient_records" ON public.patient_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete patient_records" ON public.patient_records FOR DELETE USING (true);

-- 6. INITIAL SEED DATA FOR SAI HOMOEO CLINIC (BARIDIH)
-- ------------------------------------------------------------------------------
INSERT INTO public.clinics (
    id,
    slug,
    name,
    doctor_name,
    doctor_qualification,
    phone,
    whatsapp_number,
    address,
    slot_duration_minutes
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'sai-homoeo-baridih',
    'Sai Homoeo Clinic',
    'Dr. S. K. Sharma',
    'B.H.M.S (Classical Homoeopathy)',
    '+91 98765 43210',
    '919876543210',
    'Near Ramni Kali Mandir, Baridih, Jamshedpur - 831017, Jharkhand',
    15
) ON CONFLICT (slug) DO UPDATE SET
    slot_duration_minutes = 15;

-- Seed default schedules (Mon to Sat: 10AM-2PM & 5PM-10PM | Sun: 10AM-1PM)
-- 0 = Sunday
INSERT INTO public.clinic_schedules (clinic_id, day_of_week, shift_1_start, shift_1_end, shift_2_start, shift_2_end, is_closed)
VALUES 
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 0, '10:00:00', '13:00:00', NULL, NULL, false), -- Sunday
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '10:00:00', '14:00:00', '17:00:00', '22:00:00', false), -- Monday
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, '10:00:00', '14:00:00', '17:00:00', '22:00:00', false), -- Tuesday
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, '10:00:00', '14:00:00', '17:00:00', '22:00:00', false), -- Wednesday
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, '10:00:00', '14:00:00', '17:00:00', '22:00:00', false), -- Thursday
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, '10:00:00', '14:00:00', '17:00:00', '22:00:00', false), -- Friday
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, '10:00:00', '14:00:00', '17:00:00', '22:00:00', false)  -- Saturday
ON CONFLICT (clinic_id, day_of_week) DO NOTHING;
