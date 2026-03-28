-- ==========================================
-- ADD: Append a record to the bottom of the sorted list
-- ==========================================
CREATE OR REPLACE FUNCTION add_to_sort(media_type text, record_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  col_name text;
  max_position integer;
  current_position integer;
BEGIN
  -- Security check for valid column prefixes
  IF media_type NOT IN ('anime', 'movie', 'series') THEN
    RAISE EXCEPTION 'Invalid media type.';
  END IF;

  col_name := 'sort_order_' || media_type;

  -- Step 1: Check if the record is already in the list
  EXECUTE format('SELECT %I FROM records WHERE id = $1', col_name)
  INTO current_position USING record_id;

  -- If it already has a sort order, do nothing and exit
  IF current_position IS NOT NULL THEN
    RETURN;
  END IF;

  -- Step 2: Find the current highest position in that specific list
  EXECUTE format('SELECT MAX(%I) FROM records', col_name)
  INTO max_position;

  -- If the list is entirely empty, start at 1. Otherwise, add 1 to the max.
  max_position := COALESCE(max_position, 0) + 1;

  -- Step 3: Assign the new bottom position to the record
  EXECUTE format('UPDATE records SET %I = $1 WHERE id = $2', col_name)
  USING max_position, record_id;

END;
$$;

-- ==========================================
-- REMOVE: Take record out of sorted list
-- ==========================================
CREATE OR REPLACE FUNCTION remove_from_sort(media_type text, record_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  col_name text;
  old_sort_order integer;
BEGIN
  IF media_type NOT IN ('anime', 'movie', 'series') THEN RAISE EXCEPTION 'Invalid media type.'; END IF;
  col_name := 'sort_order_' || media_type;

  EXECUTE format('SELECT %I FROM records WHERE id = $1', col_name) INTO old_sort_order USING record_id;

  IF old_sort_order IS NOT NULL THEN
    EXECUTE format('UPDATE records SET %I = NULL WHERE id = $1', col_name) USING record_id;
    EXECUTE format('UPDATE records SET %I = %I - 1 WHERE %I > $1', col_name, col_name, col_name) USING old_sort_order;
  END IF;
END;
$$;

-- ==========================================
-- DELETE TRIGGER: Fix gaps across ALL lists
-- ==========================================
-- Since a deleted record might belong to multiple lists,
-- it's safest and easiest to just check all three columns natively.
CREATE OR REPLACE FUNCTION reorder_after_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.sort_order_anime IS NOT NULL THEN
    UPDATE records SET sort_order_anime = sort_order_anime - 1 WHERE sort_order_anime > OLD.sort_order_anime;
  END IF;

  IF OLD.sort_order_movie IS NOT NULL THEN
    UPDATE records SET sort_order_movie = sort_order_movie - 1 WHERE sort_order_movie > OLD.sort_order_movie;
  END IF;

  IF OLD.sort_order_series IS NOT NULL THEN
    UPDATE records SET sort_order_series = sort_order_series - 1 WHERE sort_order_series > OLD.sort_order_series;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS fix_sort_after_delete ON records;
CREATE TRIGGER fix_sort_after_delete
AFTER DELETE ON records
FOR EACH ROW
EXECUTE FUNCTION reorder_after_delete();

-- ==========================================
-- UPDATE SINGLE: Move one record and shift the rest
-- ==========================================
CREATE OR REPLACE FUNCTION update_single_sort_order(media_type text, record_id integer, new_position integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  col_name text;
  old_position integer;
  max_position integer;
BEGIN
  IF media_type NOT IN ('anime', 'movie', 'series') THEN RAISE EXCEPTION 'Invalid media type.'; END IF;
  col_name := 'sort_order_' || media_type;

  EXECUTE format('SELECT %I FROM records WHERE id = $1', col_name) INTO old_position USING record_id;
  EXECUTE format('SELECT MAX(%I) FROM records', col_name) INTO max_position;

  IF new_position > max_position THEN
    IF old_position IS NULL THEN new_position := COALESCE(max_position, 0) + 1;
    ELSE new_position := max_position; END IF;
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