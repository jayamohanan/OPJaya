| table_name               | complete_create_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| assembly                 | CREATE TABLE public.assembly (
  assembly_name_en text NULL,
  assembly_id text NOT NULL,
  assembly_name_ml text NULL,
  district_id text NULL,
  CONSTRAINT assembly_district_id_fkey FOREIGN KEY (district_id) REFERENCES district (district_id),
  CONSTRAINT assembly_pkey PRIMARY KEY (assembly_id)
);                                                                                                                                                                                                                                                                                |
| assembly_category        | CREATE TABLE public.assembly_category (
  category text NOT NULL,
  assembly_id text NOT NULL,
  CONSTRAINT assembly_category_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES assembly (assembly_id),
  CONSTRAINT assembly_category_pkey PRIMARY KEY (assembly_id)
);                                                                                                                                                                                                                                                                                                                |
| district                 | CREATE TABLE public.district (
  district_name_en text NULL,
  district_id text NOT NULL,
  district_name_ml text NULL,
  CONSTRAINT district_pkey PRIMARY KEY (district_id)
);                                                                                                                                                                                                                                                                                                                                                                                                             |
| district_category        | CREATE TABLE public.district_category (
  district_id text NOT NULL,
  category text NOT NULL,
  CONSTRAINT district_category_district_id_fkey FOREIGN KEY (district_id) REFERENCES district (district_id),
  CONSTRAINT district_category_pkey PRIMARY KEY (district_id)
);                                                                                                                                                                                                                                                                                                                |
| invites                  | CREATE TABLE public.invites (
  id uuid NOT NULL,
  token uuid NOT NULL,
  role text NOT NULL,
  local_body_id text NOT NULL,
  used boolean NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NULL,
  CONSTRAINT invites_pkey PRIMARY KEY (id)
);                                                                                                                                                                                                                                                                                                                     |
| issues                   | CREATE TABLE public.issues (
  local_body_id text NOT NULL,
  id uuid NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  location_url text NULL,
  resolved boolean NOT NULL,
  created_at timestamp with time zone NULL,
  town_id uuid NULL,
  image_url text NULL,
  CONSTRAINT issues_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id),
  CONSTRAINT issues_pkey PRIMARY KEY (id),
  CONSTRAINT issues_town_id_fkey FOREIGN KEY (town_id) REFERENCES town (town_id)
);                                                                  |
| local_body               | CREATE TABLE public.local_body (
  assembly_id text NULL,
  local_body_name_en text NULL,
  block_name_en text NULL,
  district_panchayat_name_en text NULL,
  local_body_name_ml text NULL,
  local_body_id text NOT NULL,
  type_id text NULL,
  CONSTRAINT local_body_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES assembly (assembly_id),
  CONSTRAINT local_body_pkey PRIMARY KEY (local_body_id),
  CONSTRAINT local_body_type_id_fkey FOREIGN KEY (type_id) REFERENCES local_body_type (type_id)
);                                                                         |
| local_body_category      | CREATE TABLE public.local_body_category (
  category text NOT NULL,
  local_body_id text NOT NULL,
  CONSTRAINT local_body_category_pkey PRIMARY KEY (local_body_id),
  CONSTRAINT local_body_category_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id)
);                                                                                                                                                                                                                                                                                              |
| local_body_type          | CREATE TABLE public.local_body_type (
  type_name_en text NOT NULL,
  type_name_ml text NOT NULL,
  type_id text NOT NULL,
  CONSTRAINT local_body_type_pkey PRIMARY KEY (type_id)
);                                                                                                                                                                                                                                                                                                                                                                                                       |
| profiles                 | CREATE TABLE public.profiles (
  id uuid NOT NULL,
  local_body_id text NOT NULL,
  created_at timestamp with time zone NULL,
  role text NULL,
  CONSTRAINT profiles_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);                                                                                                                                                                                                                                                                                  |
| town                     | CREATE TABLE public.town (
  town_name_ml text NULL,
  town_name_en text NULL,
  lat double precision NULL,
  lng double precision NULL,
  local_body_id text NULL,
  created_at timestamp with time zone NOT NULL,
  town_id uuid NOT NULL,
  CONSTRAINT town_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id),
  CONSTRAINT town_pkey PRIMARY KEY (town_id)
);                                                                                                                                                                                        |
| town_status              | CREATE TABLE public.town_status (
  has_proper_bin_usage boolean NULL,
  is_current boolean NOT NULL,
  status_id uuid NOT NULL,
  town_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  has_sufficient_bins boolean NULL,
  meets_cleanliness_standards boolean NULL,
  CONSTRAINT town_status_town_id_fkey FOREIGN KEY (town_id) REFERENCES town (town_id),
  CONSTRAINT town_status_pkey PRIMARY KEY (status_id)
);                                                                                                                                                   |
| town_with_current_status | CREATE TABLE public.town_with_current_status (
  town_name_en text NULL,
  local_body_id text NULL,
  has_proper_bin_usage boolean NULL,
  town_name_ml text NULL,
  town_id uuid NULL,
  meets_cleanliness_standards boolean NULL,
  has_sufficient_bins boolean NULL,
  status_created_at timestamp with time zone NULL,
  status_id uuid NULL,
  town_created_at timestamp with time zone NULL
);                                                                                                                                                                                        |
| ward                     | CREATE TABLE public.ward (
  local_body_id text NULL,
  ward_name_ml text NULL,
  ward_id text NOT NULL,
  ward_no text NULL,
  ward_name_en text NULL,
  elected_member_en text NULL,
  role text NULL,
  party text NULL,
  reservation text NULL,
  last_path_segment text NULL,
  elected_member_ml text NULL,
  CONSTRAINT ward_pkey PRIMARY KEY (ward_id),
  CONSTRAINT ward_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id)
);                                                                                                                  |
| ward_collection          | CREATE TABLE public.ward_collection (
  year_month date NOT NULL,
  ward_id text NOT NULL,
  collection_id integer NOT NULL,
  rate numeric NOT NULL,
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (ward_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (ward_id),
  CONSTRAINT ward_collection_pkey PRIMARY KEY (collection_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (year_month),
  CONSTRAINT ward_collection_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES ward (ward_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (year_month)
); |