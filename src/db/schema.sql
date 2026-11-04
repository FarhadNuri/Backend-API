CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'DOCTOR', 'ADMIN')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  city    TEXT,
  area    TEXT,
  lat     DOUBLE PRECISION,
  lng     DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS specialties (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS doctors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialty_id     UUID NOT NULL REFERENCES specialties(id),
  bmdc_number      TEXT NOT NULL UNIQUE,
  degrees          TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  bio              TEXT,
  status           TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty_status ON doctors (specialty_id, status);

CREATE TABLE IF NOT EXISTS chambers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  city       TEXT NOT NULL,
  area       TEXT NOT NULL,
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  phone      TEXT,
  fee        INTEGER NOT NULL CHECK (fee > 0),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chambers_doctor ON chambers (doctor_id);
CREATE INDEX IF NOT EXISTS idx_chambers_location ON chambers (lat, lng);

CREATE TABLE IF NOT EXISTS chamber_schedules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id UUID NOT NULL REFERENCES chambers(id) ON DELETE CASCADE,
  day        TEXT NOT NULL CHECK (day IN ('SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI')),
  start_time TEXT NOT NULL, -- "17:00"
  end_time   TEXT NOT NULL, -- "21:00"
  UNIQUE (chamber_id, day)
);

CREATE TABLE IF NOT EXISTS diseases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  aliases      TEXT[] NOT NULL DEFAULT '{}', -- store in lowercase
  specialty_id UUID NOT NULL REFERENCES specialties(id)
);
CREATE INDEX IF NOT EXISTS idx_diseases_specialty ON diseases (specialty_id);

CREATE TABLE IF NOT EXISTS areas (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  lat  DOUBLE PRECISION NOT NULL,
  lng  DOUBLE PRECISION NOT NULL,
  UNIQUE (name, city)
);

