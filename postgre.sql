-- SETTINGS (single row — property config)
create table
    settings (
        id integer primary key default 1,
        max_occupancy integer default 4,
        base_rate integer default 10000,
        base_occupancy integer default 2,
        extra_person_fee integer default 1500,
        min_nights integer default 1,
        checkin_from text default '15:00',
        checkin_to text default '23:00',
        checkout_by text default '11:00',
        whatsapp text default '',
        contact_email text default ''
    );

-- Insert the single settings row immediately
insert into
    settings (id)
values
    (1);

-- BOOKINGS
create table
    bookings (
        id uuid primary key default gen_random_uuid (),
        created_at timestamptz default now (),
        checkin date not null,
        checkout date not null,
        guests integer not null,
        guest_name text not null,
        guest_email text not null,
        guest_phone text not null,
        special_requests text default '',
        total_eur integer not null,
        paypal_order_id text unique,
        paypal_capture_id text unique,
        status text default 'pending'
    );

-- BLOCKED DATES (manual blocks by admin)
create table
    blocked_dates (
        id uuid primary key default gen_random_uuid (),
        date date not null unique,
        reason text default 'blocked'
    );

-- PRICING OVERRIDES (seasonal rates)
create table
    pricing (
        id uuid primary key default gen_random_uuid (),
        created_at timestamptz default now (),
        date_from date not null,
        date_to date not null,
        price_eur integer not null,
        extra_person_fee integer,
        label text default ''
    );

-- ICAL CACHE (stores last fetched Booking.com blocked dates)
create table
    ical_cache (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz default now ()
    );

-- ROW LEVEL SECURITY
alter table settings enable row level security;

alter table bookings enable row level security;

alter table blocked_dates enable row level security;

alter table pricing enable row level security;

alter table ical_cache enable row level security;

-- PUBLIC READ POLICIES (needed by the booking widget and calendar)
create policy "Public read settings" on settings for
select
    using (true);

create policy "Public read pricing" on pricing for
select
    using (true);

create policy "Public read blocked dates" on blocked_dates for
select
    using (true);

create policy "Public read ical cache" on ical_cache for
select
    using (true);

-- Bookings: public can insert (guest creates booking), only service role reads
create policy "Public insert bookings" on bookings for insert
with
    check (true);

create policy "Public read own booking" on bookings for
select
    using (true);

-- SERVICE ROLE handles all writes via API routes — no extra policies needed
-- as service role bypasses RLS entirely

drop table ical_cache;

create table ical_cache (
  id int primary key,
  dates text[] not null default '{}',
  synced_at timestamptz
);
insert into ical_cache (id, dates) values (1, '{}');

alter table ical_cache enable row level security;
create policy "Public read ical cache" on ical_cache for select using (true);