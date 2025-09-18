# Supabase Table Schema

## Table: assembly
```
create table public.assembly (
  assembly_id text not null,
  assembly_name_en text null,
  assembly_name_ml text null,
  district_id text null,
  constraint assembly_pkey primary key (assembly_id)
) TABLESPACE pg_default;
```

## Table: district
```
create table public.district (
  district_id text not null,
  district_name_en text null,
  district_name_ml text null,
  constraint district_pkey primary key (district_id)
) TABLESPACE pg_default;
```

## Table: local_body
```
create table public.local_body (
  local_body_id text not null,
  local_body_name_en text null,
  local_body_type_en text null,
  block_name_en text null,
  district_panchayat_name_en text null,
  local_body_name_ml text null,
  local_body_type_ml text null,
  assembly_id text null,
  district_id text null,
  constraint local_body_pkey primary key (local_body_id)
) TABLESPACE pg_default;
```

## Table: town
```
create table public.town (
  town_id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  town_name_en text null,
  town_name_ml text null,
  local_body_id text null,
  has_sufficient_bins boolean null,
  meets_cleanliness_standards boolean null,
  has_proper_bin_usage boolean null,
  constraint town_pkey primary key (town_id),
  constraint town_local_body_id_fkey foreign KEY (local_body_id) references local_body (local_body_id)
) TABLESPACE pg_default;
```

## Table: ward
```
create table public.ward (
  ward_id text not null,
  ward_no text null,
  ward_name_en text null,
  elected_member_en text null,
  role text null,
  party text null,
  reservation text null,
  last_path_segment text null,
  ward_name_ml text null,
  elected_member_ml text null,
  local_body_id text null,
  constraint ward_pkey primary key (ward_id),
  constraint ward_local_body_id_fkey foreign KEY (local_body_id) references local_body (local_body_id)
) TABLESPACE pg_default;
```

## Table: lb_data
```
CREATE  TABLE public.lb_data (
  "Name_email" text NULL,
  "Local Body" text NULL,
  "Local Body Type" text NULL,
  "LSG Code" text NOT NULL,
  "Block" text NULL,
  "Assembly" text NULL,
  "District" text NULL,
  "District Panchayat" text NULL,
  wikidata link text NULL,
  "Name_std_ml" text NULL,
  wikidata-kml text NULL,
  "Local Body Full_ml" text NULL,
  വെബ്സൈറ്റ്‌ text NULL,
  "Assembly(s)" text NULL,
  CONSTRAINT lb_data_pkey PRIMARY KEY ("LSG Code")
) TABLESPACE pg_default;
```
