-- Pincode directory (India Post full dataset — one row per post office)
CREATE TABLE IF NOT EXISTS pincode_directory (
  id SERIAL PRIMARY KEY,
  circle_name VARCHAR(200),
  region_name VARCHAR(200),
  division_name VARCHAR(200),
  office_name VARCHAR(255) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  office_type VARCHAR(20),
  delivery VARCHAR(50),
  district VARCHAR(150),
  state_name VARCHAR(100) NOT NULL,
  latitude VARCHAR(30),
  longitude VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pincode_directory_pincode ON pincode_directory(pincode);
CREATE INDEX IF NOT EXISTS idx_pincode_directory_state ON pincode_directory(state_name);
CREATE INDEX IF NOT EXISTS idx_pincode_directory_district ON pincode_directory(district);
