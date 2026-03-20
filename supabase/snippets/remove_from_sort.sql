-- ==========================================
-- 4. REMOVE: Take record out of sorted list
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