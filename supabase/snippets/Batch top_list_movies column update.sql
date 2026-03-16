SELECT t.*
FROM unnest(ARRAY[213, 494, 245, 247, 280, 192, 471, 1048, 216, 1005, 326, 482, 1044, 645, 1038, 430, 681, 190, 373, 672, 402]::int[]) WITH ORDINALITY AS input(id, ord)
JOIN records t ON t.id = input.id
ORDER BY input.ord;

UPDATE records AS t
SET sort_order_movie = input.pos
FROM unnest(ARRAY[213, 494, 245, 247, 280, 192, 471, 1048, 216, 1005, 326, 482, 1044, 645, 1038, 430, 681, 190, 373, 672, 402]::int[]) WITH ORDINALITY AS input(id, pos)
WHERE t.id = input.id;