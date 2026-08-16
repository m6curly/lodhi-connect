-- =========================================================
-- LODHI CONNECT
-- FIX: Secure complaint number + initial complaint timeline
-- =========================================================

-- 1. Make the complaint counter trigger function SECURITY DEFINER.
-- This allows the database trigger to update the counter safely
-- without giving residents direct access to the counter table.

create or replace function public.make_complaint_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_no integer;
begin

  insert into public.daily_complaint_counters (
    counter_date,
    last_number
  )
  values (
    current_date,
    1
  )
  on conflict (counter_date)
  do update
    set last_number =
      public.daily_complaint_counters.last_number + 1
  returning last_number into seq_no;

  new.complaint_number :=
    'LC-' ||
    new.block ||
    '-' ||
    to_char(current_date, 'YYYYMMDD') ||
    '-' ||
    lpad(seq_no::text, 4, '0');

  return new;
end;
$$;


-- 2. Make sure the counter table is protected.
-- Residents do NOT need direct access to this table.

alter table public.daily_complaint_counters
enable row level security;


-- 3. Remove any old direct-access policies if they exist.

drop policy if exists daily_counter_select
on public.daily_complaint_counters;

drop policy if exists daily_counter_insert
on public.daily_complaint_counters;

drop policy if exists daily_counter_update
on public.daily_complaint_counters;

drop policy if exists daily_counter_delete
on public.daily_complaint_counters;


-- 4. Secure the initial complaint timeline trigger.
-- Resident should not directly insert complaint_updates.
-- The database trigger will do it securely.

create or replace function public.seed_complaint_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.complaint_updates (
    complaint_id,
    status,
    remark
  )
  values (
    new.id,
    new.status,
    'Complaint submitted to Lodhi Connect.'
  );

  return new;
end;
$$;


-- 5. Recreate the complaint number trigger.

drop trigger if exists complaints_number
on public.complaints;

create trigger complaints_number
before insert on public.complaints
for each row
when (
  new.complaint_number is null
  or new.complaint_number = ''
)
execute function public.make_complaint_number();


-- 6. Recreate the initial complaint timeline trigger.

drop trigger if exists complaint_initial_update
on public.complaints;

create trigger complaint_initial_update
after insert on public.complaints
for each row
execute function public.seed_complaint_update();


-- 7. Explicitly allow the authenticated application
-- to execute the trigger functions.
-- This does NOT give residents direct table access.

grant execute
on function public.make_complaint_number()
to authenticated;

grant execute
on function public.seed_complaint_update()
to authenticated;


-- =========================================================
-- DONE
-- =========================================================