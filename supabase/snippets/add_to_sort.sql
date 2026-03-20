-- ==========================================
-- 6. ADD: Append a record to the bottom of the list
-- ==========================================
CREATE OR REPLACE FUNCTION add_to_sort(media_type text, record_id uuid)
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