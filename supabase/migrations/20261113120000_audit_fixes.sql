-- ==========================================
-- Audit fixes (2026-11-13)
-- ==========================================

-- ------------------------------------------
-- 1. Data integrity: one record per (year, slug)
-- ------------------------------------------
-- The app already checks for duplicates before inserting, but nothing in the
-- database enforced it. Record URLs are /<mediatype>/<year>/<slug>, so a
-- duplicate would make one of the two records unreachable.
-- NOTE: fails if duplicates already exist; find them first with:
--   SELECT year, slug, count(*) FROM records GROUP BY 1, 2 HAVING count(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS records_year_slug_key ON records (year, slug);

-- Home page orders by watchedat
CREATE INDEX IF NOT EXISTS records_watchedat_idx ON records (watchedat DESC);

-- ------------------------------------------
-- 2. Remove legacy top-list tables
-- ------------------------------------------
-- Replaced by the sort_order_* columns on records; no code reads them anymore.
DROP TABLE IF EXISTS list_top_anime;
DROP TABLE IF EXISTS list_top_movies;
DROP TABLE IF EXISTS list_top_series;

-- ------------------------------------------
-- 3. Sort order functions
-- ------------------------------------------
-- * Pin search_path (Supabase linter: function_search_path_mutable)
-- * update_single_sort_order: reject positions < 1 and clamp correctly when
--   the list is empty (previously `new_position > NULL` skipped the clamp,
--   leaving gaps such as a single item at position 5).
CREATE OR REPLACE FUNCTION update_single_sort_order(media_type text, record_id integer, new_position integer)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  col_name text;
  old_position integer;
  max_position integer;
BEGIN
  IF media_type NOT IN ('anime', 'movie', 'series') THEN RAISE EXCEPTION 'Invalid media type.'; END IF;
  IF new_position IS NULL OR new_position < 1 THEN RAISE EXCEPTION 'Position must be 1 or greater.'; END IF;
  col_name := 'sort_order_' || media_type;

  EXECUTE format('SELECT %I FROM records WHERE id = $1', col_name) INTO old_position USING record_id;
  EXECUTE format('SELECT MAX(%I) FROM records', col_name) INTO max_position;
  max_position := COALESCE(max_position, 0);

  IF old_position IS NULL THEN
    -- New entry: can go at most one past the end
    IF new_position > max_position + 1 THEN new_position := max_position + 1; END IF;
  ELSE
    -- Existing entry: can go at most to the end
    IF new_position > max_position THEN new_position := max_position; END IF;
  END IF;

  IF old_position = new_position THEN RETURN; END IF;

  IF old_position IS NOT NULL THEN
    IF new_position < old_position THEN
      EXECUTE format('UPDATE records SET %I = %I + 1 WHERE %I >= $1 AND %I < $2', col_name, col_name, col_name, col_name) USING new_position, old_position;
    ELSE
      EXECUTE format('UPDATE records SET %I = %I - 1 WHERE %I > $1 AND %I <= $2', col_name, col_name, col_name, col_name) USING old_position, new_position;
    END IF;
  ELSE
    EXECUTE format('UPDATE records SET %I = %I + 1 WHERE %I >= $1', col_name, col_name, col_name) USING new_position;
  END IF;

  EXECUTE format('UPDATE records SET %I = $1 WHERE id = $2', col_name) USING new_position, record_id;
END;
$$;

ALTER FUNCTION add_to_sort(text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION remove_from_sort(text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION reorder_after_delete() SET search_path = public, pg_temp;

-- Only logged-in users may call the sort RPCs (functions are executable by
-- PUBLIC by default; RLS already blocked anon writes, this just closes the door).
REVOKE EXECUTE ON FUNCTION add_to_sort(text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION remove_from_sort(text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION update_single_sort_order(text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION add_to_sort(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_from_sort(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_single_sort_order(text, integer, integer) TO authenticated;
