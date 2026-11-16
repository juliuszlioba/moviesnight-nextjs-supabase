-- ==========================================
-- Record tier grading (2026-11-16)
-- ==========================================
-- Optional tier-list grade for any record, shown as a sticker on the poster.
ALTER TABLE records
  ADD COLUMN IF NOT EXISTS tier VARCHAR(1)
  CONSTRAINT records_tier_check CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'F'));
