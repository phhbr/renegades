drop trigger if exists "update_press_coverage_updated_at" on "public"."press_coverage";

drop policy "Active press coverage is viewable by everyone" on "public"."press_coverage";

drop policy "Press coverage is manageable by admin users" on "public"."press_coverage";

revoke delete on table "public"."press_coverage" from "anon";

revoke insert on table "public"."press_coverage" from "anon";

revoke references on table "public"."press_coverage" from "anon";

revoke select on table "public"."press_coverage" from "anon";

revoke trigger on table "public"."press_coverage" from "anon";

revoke truncate on table "public"."press_coverage" from "anon";

revoke update on table "public"."press_coverage" from "anon";

revoke delete on table "public"."press_coverage" from "authenticated";

revoke insert on table "public"."press_coverage" from "authenticated";

revoke references on table "public"."press_coverage" from "authenticated";

revoke select on table "public"."press_coverage" from "authenticated";

revoke trigger on table "public"."press_coverage" from "authenticated";

revoke truncate on table "public"."press_coverage" from "authenticated";

revoke update on table "public"."press_coverage" from "authenticated";

revoke delete on table "public"."press_coverage" from "service_role";

revoke insert on table "public"."press_coverage" from "service_role";

revoke references on table "public"."press_coverage" from "service_role";

revoke select on table "public"."press_coverage" from "service_role";

revoke trigger on table "public"."press_coverage" from "service_role";

revoke truncate on table "public"."press_coverage" from "service_role";

revoke update on table "public"."press_coverage" from "service_role";

alter table "public"."press_coverage" drop constraint "press_coverage_pkey";

drop index if exists "public"."press_coverage_pkey";

drop table "public"."press_coverage";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_contact_messages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;


