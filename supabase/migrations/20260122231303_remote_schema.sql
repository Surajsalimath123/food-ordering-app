
  create table "public"."loyalty_status" (
    "user_id" uuid not null,
    "cycle_completed_count" integer not null default 0,
    "reward_available" boolean not null default false,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."loyalty_status" enable row level security;


  create table "public"."support_tickets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "subject" text not null,
    "message" text not null,
    "status" text not null default 'Open'::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."support_tickets" enable row level security;

alter table "public"."orders" add column "discount_amount" numeric not null default 0;

alter table "public"."orders" add column "discount_percent" integer not null default 0;

alter table "public"."orders" add column "subtotal" numeric not null default 0;

alter table "public"."orders" add column "total_after_discount" numeric not null default 0;

alter table "public"."orders" add column "used_loyalty_reward" boolean not null default false;

alter table "public"."profiles" add column "email" text;

alter table "public"."profiles" add column "expo_push_token" text;

alter table "public"."profiles" add column "expo_push_token_updated_at" timestamp with time zone;

CREATE UNIQUE INDEX loyalty_status_pkey ON public.loyalty_status USING btree (user_id);

CREATE UNIQUE INDEX support_tickets_pkey ON public.support_tickets USING btree (id);

alter table "public"."loyalty_status" add constraint "loyalty_status_pkey" PRIMARY KEY using index "loyalty_status_pkey";

alter table "public"."support_tickets" add constraint "support_tickets_pkey" PRIMARY KEY using index "support_tickets_pkey";

alter table "public"."loyalty_status" add constraint "loyalty_status_cycle_completed_count_check" CHECK (((cycle_completed_count >= 0) AND (cycle_completed_count <= 5))) not valid;

alter table "public"."loyalty_status" validate constraint "loyalty_status_cycle_completed_count_check";

alter table "public"."loyalty_status" add constraint "loyalty_status_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."loyalty_status" validate constraint "loyalty_status_user_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.compute_order_pricing(subtotal numeric)
 RETURNS TABLE(discount_percent integer, discount_amount numeric, total_after_discount numeric, used_loyalty_reward boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  uid uuid;
  has_reward boolean;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.loyalty_status (user_id)
  values (uid)
  on conflict (user_id) do nothing;

  select reward_available into has_reward
  from public.loyalty_status
  where user_id = uid;

  if has_reward then
    discount_percent := 50;
    discount_amount := round(subtotal * 0.50, 2);
    total_after_discount := subtotal - discount_amount;
    used_loyalty_reward := true;
  else
    discount_percent := 0;
    discount_amount := 0;
    total_after_discount := subtotal;
    used_loyalty_reward := false;
  end if;

  return next;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.consume_loyalty_reward_if_used()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if new.used_loyalty_reward = true then
    update public.loyalty_status
    set reward_available = false,
        cycle_completed_count = 0,
        updated_at = now()
    where user_id = new.user_id;
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_order_completed_loyalty()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Only run when status changes to 'completed'
  if (tg_op = 'UPDATE')
     and (old.status is distinct from new.status)
     and (new.status = 'completed') then

    insert into public.loyalty_status (user_id)
    values (new.user_id)
    on conflict (user_id) do nothing;

    update public.loyalty_status
    set
      cycle_completed_count =
        case
          when reward_available = true then cycle_completed_count -- don't change here
          when cycle_completed_count < 5 then cycle_completed_count + 1
          else 5
        end,
      reward_available =
        case
          when reward_available = true then true
          when cycle_completed_count + 1 >= 5 then true
          else false
        end,
      updated_at = now()
    where user_id = new.user_id;

  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_order_paid_loyalty()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  should_count boolean := false;
begin
  -- INSERT: count if inserted as Paid
  if (tg_op = 'INSERT') then
    if (new.status = 'Paid') then
      should_count := true;
    end if;
  end if;

  -- UPDATE: count only when status changes to Paid
  if (tg_op = 'UPDATE') then
    if (old.status is distinct from new.status) and (new.status = 'Paid') then
      should_count := true;
    end if;
  end if;

  if should_count then
    insert into public.loyalty_status (user_id)
    values (new.user_id)
    on conflict (user_id) do nothing;

    update public.loyalty_status
    set
      cycle_completed_count =
        case
          when reward_available = true then cycle_completed_count
          when cycle_completed_count < 5 then cycle_completed_count + 1
          else 5
        end,
      reward_available =
        case
          when reward_available = true then true
          when cycle_completed_count + 1 >= 5 then true
          else false
        end,
      updated_at = now()
    where user_id = new.user_id;
  end if;

  return new;
end;
$function$
;

create or replace view "public"."product_sales" as  SELECT oi.product_id,
    (sum(oi.quantity))::integer AS total_sold
   FROM (public.order_items oi
     JOIN public.orders o ON ((o.id = oi.order_id)))
  WHERE (o.status = ANY (ARRAY['Paid'::text, 'Cooking'::text, 'Delivering'::text, 'Delivered'::text]))
  GROUP BY oi.product_id;


grant delete on table "public"."loyalty_status" to "anon";

grant insert on table "public"."loyalty_status" to "anon";

grant references on table "public"."loyalty_status" to "anon";

grant select on table "public"."loyalty_status" to "anon";

grant trigger on table "public"."loyalty_status" to "anon";

grant truncate on table "public"."loyalty_status" to "anon";

grant update on table "public"."loyalty_status" to "anon";

grant delete on table "public"."loyalty_status" to "authenticated";

grant insert on table "public"."loyalty_status" to "authenticated";

grant references on table "public"."loyalty_status" to "authenticated";

grant select on table "public"."loyalty_status" to "authenticated";

grant trigger on table "public"."loyalty_status" to "authenticated";

grant truncate on table "public"."loyalty_status" to "authenticated";

grant update on table "public"."loyalty_status" to "authenticated";

grant delete on table "public"."loyalty_status" to "service_role";

grant insert on table "public"."loyalty_status" to "service_role";

grant references on table "public"."loyalty_status" to "service_role";

grant select on table "public"."loyalty_status" to "service_role";

grant trigger on table "public"."loyalty_status" to "service_role";

grant truncate on table "public"."loyalty_status" to "service_role";

grant update on table "public"."loyalty_status" to "service_role";

grant delete on table "public"."support_tickets" to "anon";

grant insert on table "public"."support_tickets" to "anon";

grant references on table "public"."support_tickets" to "anon";

grant select on table "public"."support_tickets" to "anon";

grant trigger on table "public"."support_tickets" to "anon";

grant truncate on table "public"."support_tickets" to "anon";

grant update on table "public"."support_tickets" to "anon";

grant delete on table "public"."support_tickets" to "authenticated";

grant insert on table "public"."support_tickets" to "authenticated";

grant references on table "public"."support_tickets" to "authenticated";

grant select on table "public"."support_tickets" to "authenticated";

grant trigger on table "public"."support_tickets" to "authenticated";

grant truncate on table "public"."support_tickets" to "authenticated";

grant update on table "public"."support_tickets" to "authenticated";

grant delete on table "public"."support_tickets" to "service_role";

grant insert on table "public"."support_tickets" to "service_role";

grant references on table "public"."support_tickets" to "service_role";

grant select on table "public"."support_tickets" to "service_role";

grant trigger on table "public"."support_tickets" to "service_role";

grant truncate on table "public"."support_tickets" to "service_role";

grant update on table "public"."support_tickets" to "service_role";


  create policy "read own loyalty"
  on "public"."loyalty_status"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "profiles_insert_own"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "profiles_select_own"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "read own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((id = auth.uid()));



  create policy "update own push token"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((id = auth.uid()))
with check ((id = auth.uid()));



  create policy "admin read all support tickets"
  on "public"."support_tickets"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'ADMIN'::text)))));



  create policy "admin update support tickets"
  on "public"."support_tickets"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'ADMIN'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'ADMIN'::text)))));



  create policy "create own tickets"
  on "public"."support_tickets"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "read own tickets"
  on "public"."support_tickets"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));


CREATE TRIGGER trg_consume_reward AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.consume_loyalty_reward_if_used();

CREATE TRIGGER trg_orders_paid_loyalty AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_order_paid_loyalty();


