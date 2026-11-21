SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."add_to_sort"("media_type" "text", "record_id" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
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
$_$;

ALTER FUNCTION "public"."add_to_sort"("media_type" "text", "record_id" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."remove_from_sort"("media_type" "text", "record_id" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
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
$_$;

ALTER FUNCTION "public"."remove_from_sort"("media_type" "text", "record_id" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."reorder_after_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
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

ALTER FUNCTION "public"."reorder_after_delete"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_single_sort_order"("media_type" "text", "record_id" integer, "new_position" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
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
$_$;

ALTER FUNCTION "public"."update_single_sort_order"("media_type" "text", "record_id" integer, "new_position" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."ganres" (
    "id" integer NOT NULL,
    "slug" character varying NOT NULL,
    "title" character varying
);

ALTER TABLE "public"."ganres" OWNER TO "postgres";

ALTER TABLE "public"."ganres" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."ganres_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."records" (
    "id" bigint NOT NULL,
    "mediatype" character varying NOT NULL,
    "slug" character varying NOT NULL,
    "title" character varying NOT NULL,
    "year" smallint NOT NULL,
    "tmdbid" integer,
    "poster" character varying,
    "rating" smallint,
    "recommendation" character varying,
    "review" character varying,
    "createdat" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedat" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "watchedat" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "sort_order_anime" smallint,
    "sort_order_movie" smallint,
    "sort_order_series" smallint,
    "tier" character varying(1),
    CONSTRAINT "records_tier_check" CHECK ((("tier")::"text" = ANY ((ARRAY['S'::character varying, 'A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying, 'F'::character varying])::"text"[])))
);

ALTER TABLE "public"."records" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."records_ganres" (
    "id" bigint NOT NULL,
    "record_id" bigint NOT NULL,
    "ganre_id" integer NOT NULL
);

ALTER TABLE "public"."records_ganres" OWNER TO "postgres";

ALTER TABLE "public"."records_ganres" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."records_ganres_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."records" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."records_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."ganres"
    ADD CONSTRAINT "ganres_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."ganres"
    ADD CONSTRAINT "ganres_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."records_ganres"
    ADD CONSTRAINT "records_ganres_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."records"
    ADD CONSTRAINT "records_pkey" PRIMARY KEY ("id");

CREATE INDEX "records_watchedat_idx" ON "public"."records" USING "btree" ("watchedat" DESC);

CREATE UNIQUE INDEX "records_year_slug_key" ON "public"."records" USING "btree" ("year", "slug");

CREATE OR REPLACE TRIGGER "fix_sort_after_delete" AFTER DELETE ON "public"."records" FOR EACH ROW EXECUTE FUNCTION "public"."reorder_after_delete"();

ALTER TABLE ONLY "public"."records_ganres"
    ADD CONSTRAINT "records_ganres_ganre_id_fkey" FOREIGN KEY ("ganre_id") REFERENCES "public"."ganres"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."records_ganres"
    ADD CONSTRAINT "records_ganres_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."records"("id") ON DELETE CASCADE;

CREATE POLICY "CRUD for me only" ON "public"."ganres" TO "authenticated" USING (true);

CREATE POLICY "CRUD for me only" ON "public"."records" TO "authenticated" USING (true);

CREATE POLICY "CRUD for me only" ON "public"."records_ganres" TO "authenticated" USING (true);

CREATE POLICY "Read for all users" ON "public"."ganres" FOR SELECT USING (true);

CREATE POLICY "Read for all users" ON "public"."records" FOR SELECT USING (true);

CREATE POLICY "Read for all users" ON "public"."records_ganres" FOR SELECT USING (true);

ALTER TABLE "public"."ganres" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."records" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."records_ganres" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

REVOKE ALL ON FUNCTION "public"."add_to_sort"("media_type" "text", "record_id" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_to_sort"("media_type" "text", "record_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_to_sort"("media_type" "text", "record_id" integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."remove_from_sort"("media_type" "text", "record_id" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remove_from_sort"("media_type" "text", "record_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_from_sort"("media_type" "text", "record_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."reorder_after_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_after_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_after_delete"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."update_single_sort_order"("media_type" "text", "record_id" integer, "new_position" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_single_sort_order"("media_type" "text", "record_id" integer, "new_position" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_single_sort_order"("media_type" "text", "record_id" integer, "new_position" integer) TO "service_role";

GRANT ALL ON TABLE "public"."ganres" TO "anon";
GRANT ALL ON TABLE "public"."ganres" TO "authenticated";
GRANT ALL ON TABLE "public"."ganres" TO "service_role";

GRANT ALL ON SEQUENCE "public"."ganres_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ganres_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ganres_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."records" TO "anon";
GRANT ALL ON TABLE "public"."records" TO "authenticated";
GRANT ALL ON TABLE "public"."records" TO "service_role";

GRANT ALL ON TABLE "public"."records_ganres" TO "anon";
GRANT ALL ON TABLE "public"."records_ganres" TO "authenticated";
GRANT ALL ON TABLE "public"."records_ganres" TO "service_role";

GRANT ALL ON SEQUENCE "public"."records_ganres_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."records_ganres_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."records_ganres_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."records_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."records_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."records_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
