SELECT t.*
FROM unnest(ARRAY[571, 628, 110, 377, 197, 1062, 1114, 465, 365, 181, 46, 400, 22, 684, 500]::int[]) WITH ORDINALITY AS input(id, ord)
JOIN records t ON t.id = input.id
ORDER BY input.ord;

UPDATE records AS t
SET sort_order_series = input.pos
FROM unnest(ARRAY[571, 628, 110, 377, 197, 1062, 1114, 465, 365, 181, 46, 400, 22, 684, 500]::int[]) WITH ORDINALITY AS input(id, pos)
WHERE t.id = input.id;