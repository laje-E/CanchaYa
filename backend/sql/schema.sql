CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  sport VARCHAR(40) NOT NULL,
  location VARCHAR(180) NOT NULL,
  price_per_hour NUMERIC(12,2) NOT NULL CHECK (price_per_hour > 0),
  image_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  opening_hour INTEGER NOT NULL DEFAULT 8 CHECK (opening_hour BETWEEN 0 AND 23),
  closing_hour INTEGER NOT NULL DEFAULT 23 CHECK (closing_hour BETWEEN 1 AND 24),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (closing_hour > opening_hour)
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  court_id BIGINT NOT NULL REFERENCES courts(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (60,90,120)),
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_at > start_at)
);

-- La restricción se aplica en la base: dos operaciones concurrentes tampoco pueden
-- confirmar reservas que se superpongan para la misma cancha.
DO $$ BEGIN
  ALTER TABLE bookings ADD CONSTRAINT no_overlapping_active_bookings
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  ) WHERE (status IN ('PENDING','CONFIRMED'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings(user_id, start_at DESC);
CREATE INDEX IF NOT EXISTS bookings_court_idx ON bookings(court_id, start_at);
