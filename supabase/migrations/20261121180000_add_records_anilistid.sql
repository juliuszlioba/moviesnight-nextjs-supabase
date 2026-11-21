-- Link a record to its anime on AniList (https://anilist.co/anime/<id>)
ALTER TABLE "public"."records" ADD COLUMN IF NOT EXISTS "anilistid" integer;
