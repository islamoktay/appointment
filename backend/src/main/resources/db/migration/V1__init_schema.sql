-- 1. Core User Entities
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('PROVIDER', 'CLIENT')),
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Weekly Recurring Availability Definitions (1 = Monday .. 7 = Sunday)
CREATE TABLE provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30 CHECK (slot_duration_minutes IN (15, 30, 60)),
  CONSTRAINT chk_schedule_time_window CHECK (start_time < end_time),
  CONSTRAINT unq_provider_day UNIQUE (provider_id, day_of_week)
);

-- 3. Appointment Records with Optimistic Concurrency Control
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES users(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED')),
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_appointment_time_window CHECK (start_time < end_time)
);

-- 4. Hard Concurrency Guard (Prevents overlapping active slots)
CREATE UNIQUE INDEX idx_unique_active_slot
ON appointments (provider_id, appointment_date, start_time)
WHERE status IN ('CONFIRMED', 'IN_PROGRESS');
