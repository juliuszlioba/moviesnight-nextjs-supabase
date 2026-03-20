-- ==========================================
-- 5. DELETE TRIGGER: Fix gaps across ALL lists
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