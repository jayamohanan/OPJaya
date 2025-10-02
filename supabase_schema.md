| table_name               | complete_create_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| assembly                 | CREATE TABLE public.assembly (
  assembly_name_ml text NULL,
  district_id text NULL,
  is_active boolean NOT NULL,
  assembly_name_en text NULL,
  assembly_id text NOT NULL,
  CONSTRAINT assembly_pkey PRIMARY KEY (assembly_id),
  CONSTRAINT assembly_district_id_fkey FOREIGN KEY (district_id) REFERENCES district (district_id)
);                                                                                                                                                                                                                                                  |
| assembly_category        | CREATE TABLE public.assembly_category (
  assembly_id text NOT NULL,
  category text NOT NULL,
  CONSTRAINT assembly_category_pkey PRIMARY KEY (assembly_id),
  CONSTRAINT assembly_category_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES assembly (assembly_id)
);                                                                                                                                                                                                                                                                                                                |
| district                 | CREATE TABLE public.district (
  district_name_en text NULL,
  district_name_ml text NULL,
  district_id text NOT NULL,
  is_active boolean NOT NULL,
  CONSTRAINT district_pkey PRIMARY KEY (district_id)
);                                                                                                                                                                                                                                                                                                                                                                               |
| district_category        | CREATE TABLE public.district_category (
  district_id text NOT NULL,
  category text NOT NULL,
  CONSTRAINT district_category_pkey PRIMARY KEY (district_id),
  CONSTRAINT district_category_district_id_fkey FOREIGN KEY (district_id) REFERENCES district (district_id)
);                                                                                                                                                                                                                                                                                                                |
| invites                  | CREATE TABLE public.invites (
  role text NOT NULL,
  token uuid NOT NULL,
  id uuid NOT NULL,
  created_at timestamp with time zone NULL,
  local_body_id text NOT NULL,
  email text NOT NULL,
  used boolean NOT NULL,
  CONSTRAINT invites_pkey PRIMARY KEY (id)
);                                                                                                                                                                                                                                                                                                                     |
| issues                   | CREATE TABLE public.issues (
  type text NOT NULL,
  town_id uuid NULL,
  id uuid NOT NULL,
  location_url text NULL,
  resolved boolean NOT NULL,
  created_at timestamp with time zone NULL,
  description text NOT NULL,
  local_body_id text NOT NULL,
  image_url text NULL,
  CONSTRAINT issues_pkey PRIMARY KEY (id),
  CONSTRAINT issues_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (id),
  CONSTRAINT issues_town_id_fkey FOREIGN KEY (town_id) REFERENCES town (town_id)
);                                                                             |
| local_body               | CREATE TABLE public.local_body (
  local_body_name_en text NULL,
  is_active boolean NOT NULL,
  block_name_en text NULL,
  district_panchayat_name_en text NULL,
  local_body_name_ml text NULL,
  assembly_id text NULL,
  local_body_type_id text NULL,
  id text NOT NULL,
  CONSTRAINT local_body_pkey PRIMARY KEY (id),
  CONSTRAINT local_body_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES assembly (assembly_id),
  CONSTRAINT local_body_local_body_type_id_fkey FOREIGN KEY (local_body_type_id) REFERENCES local_body_type (type_id)
);                                |
| local_body_category      | CREATE TABLE public.local_body_category (
  category text NOT NULL,
  local_body_id text NOT NULL,
  CONSTRAINT local_body_category_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (id),
  CONSTRAINT local_body_category_pkey PRIMARY KEY (local_body_id)
);                                                                                                                                                                                                                                                                                                         |
| local_body_type          | CREATE TABLE public.local_body_type (
  type_name_en text NOT NULL,
  type_name_ml text NOT NULL,
  type_id text NOT NULL,
  CONSTRAINT local_body_type_pkey PRIMARY KEY (type_id)
);                                                                                                                                                                                                                                                                                                                                                                                                       |
| profiles                 | CREATE TABLE public.profiles (
  role text NULL,
  id uuid NOT NULL,
  created_at timestamp with time zone NULL,
  local_body_id text NOT NULL,
  CONSTRAINT profiles_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (id),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);                                                                                                                                                                                                                                                                                             |
| town                     | CREATE TABLE public.town (
  local_body_id text NULL,
  created_at timestamp with time zone NOT NULL,
  town_id uuid NOT NULL,
  lng double precision NULL,
  lat double precision NULL,
  town_name_en text NULL,
  town_name_ml text NULL,
  CONSTRAINT town_pkey PRIMARY KEY (town_id),
  CONSTRAINT town_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (id)
);                                                                                                                                                                                                   |
| town_status              | CREATE TABLE public.town_status (
  town_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  is_current boolean NOT NULL,
  has_proper_bin_usage boolean NULL,
  meets_cleanliness_standards boolean NULL,
  status_id uuid NOT NULL,
  has_sufficient_bins boolean NULL,
  CONSTRAINT town_status_town_id_fkey FOREIGN KEY (town_id) REFERENCES town (town_id),
  CONSTRAINT town_status_pkey PRIMARY KEY (status_id)
);                                                                                                                                                   |
| town_with_current_status | CREATE TABLE public.town_with_current_status (
  meets_cleanliness_standards boolean NULL,
  local_body_id text NULL,
  town_created_at timestamp with time zone NULL,
  town_id uuid NULL,
  has_proper_bin_usage boolean NULL,
  status_id uuid NULL,
  town_name_ml text NULL,
  town_name_en text NULL,
  has_sufficient_bins boolean NULL,
  status_created_at timestamp with time zone NULL
);                                                                                                                                                                                        |
| ward                     | CREATE TABLE public.ward (
  elected_member_ml text NULL,
  local_body_id text NULL,
  ward_id text NOT NULL,
  ward_no text NULL,
  ward_name_en text NULL,
  elected_member_en text NULL,
  role text NULL,
  party text NULL,
  reservation text NULL,
  last_path_segment text NULL,
  ward_name_ml text NULL,
  CONSTRAINT ward_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (id),
  CONSTRAINT ward_pkey PRIMARY KEY (ward_id)
);                                                                                                                             |
| ward_collection          | CREATE TABLE public.ward_collection (
  ward_id text NOT NULL,
  rate numeric NOT NULL,
  year_month date NOT NULL,
  collection_id integer NOT NULL,
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (year_month),
  CONSTRAINT ward_collection_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES ward (ward_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (ward_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (ward_id),
  CONSTRAINT ward_collection_pkey PRIMARY KEY (collection_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (year_month)
); |