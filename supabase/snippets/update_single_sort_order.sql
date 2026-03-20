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