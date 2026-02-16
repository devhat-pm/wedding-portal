-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON DATABASE wedding_db TO postgres;

-- Note: SQLAlchemy will create the tables automatically on application startup
-- This file is for any additional database initialization that needs to happen
-- before the application starts.

-- Optional: Create indexes for better search performance
-- These will be created by SQLAlchemy, but you can add additional ones here if needed

-- Example: Full-text search index for guest names
-- CREATE INDEX IF NOT EXISTS idx_guests_name_trgm ON guests USING gin (name gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_guests_name_ar_trgm ON guests USING gin (name_ar gin_trgm_ops);
