| table_name          | complete_create_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| assembly            | CREATE TABLE public.assembly (
  district_id text NULL,
  assembly_name_ml text NULL,
  assembly_name_en text NULL,
  assembly_id text NOT NULL,
  CONSTRAINT assembly_pkey PRIMARY KEY (assembly_id),
  CONSTRAINT assembly_district_id_fkey FOREIGN KEY (district_id) REFERENCES district (district_id)
);                                                                                                                                                                                                                                                                                |
| assembly_category   | CREATE TABLE public.assembly_category (
  assembly_id text NOT NULL,
  category text NOT NULL,
  CONSTRAINT assembly_category_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES assembly (assembly_id),
  CONSTRAINT assembly_category_pkey PRIMARY KEY (assembly_id)
);                                                                                                                                                                                                                                                                                                                |
| district            | CREATE TABLE public.district (
  district_name_en text NULL,
  district_id text NOT NULL,
  district_name_ml text NULL,
  CONSTRAINT district_pkey PRIMARY KEY (district_id)
);                                                                                                                                                                                                                                                                                                                                                                                                             |
| district_category   | CREATE TABLE public.district_category (
  category text NOT NULL,
  district_id text NOT NULL,
  CONSTRAINT district_category_pkey PRIMARY KEY (district_id),
  CONSTRAINT district_category_district_id_fkey FOREIGN KEY (district_id) REFERENCES district (district_id)
);                                                                                                                                                                                                                                                                                                                |
| invites             | CREATE TABLE public.invites (
  email text NOT NULL,
  used boolean NOT NULL,
  token uuid NOT NULL,
  created_at timestamp with time zone NULL,
  id uuid NOT NULL,
  role text NOT NULL,
  local_body_id text NOT NULL,
  CONSTRAINT invites_pkey PRIMARY KEY (id)
);                                                                                                                                                                                                                                                                                                                     |
| issues              | CREATE TABLE public.issues (
  description text NOT NULL,
  id uuid NOT NULL,
  resolved boolean NOT NULL,
  created_at timestamp with time zone NULL,
  local_body_id text NOT NULL,
  type text NOT NULL,
  location_url text NULL,
  CONSTRAINT issues_pkey PRIMARY KEY (id),
  CONSTRAINT issues_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id)
);                                                                                                                                                                                                |
| local_body          | CREATE TABLE public.local_body (
  block_name_en text NULL,
  district_panchayat_name_en text NULL,
  local_body_name_ml text NULL,
  assembly_id text NULL,
  type_id text NULL,
  local_body_id text NOT NULL,
  local_body_name_en text NULL,
  CONSTRAINT local_body_pkey PRIMARY KEY (local_body_id),
  CONSTRAINT local_body_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES assembly (assembly_id),
  CONSTRAINT local_body_type_id_fkey FOREIGN KEY (type_id) REFERENCES local_body_type (type_id)
);                                                                         |
| local_body_category | CREATE TABLE public.local_body_category (
  category text NOT NULL,
  local_body_id text NOT NULL,
  CONSTRAINT local_body_category_pkey PRIMARY KEY (local_body_id),
  CONSTRAINT local_body_category_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id)
);                                                                                                                                                                                                                                                                                              |
| local_body_type     | CREATE TABLE public.local_body_type (
  type_name_en text NOT NULL,
  type_name_ml text NOT NULL,
  type_id text NOT NULL,
  CONSTRAINT local_body_type_pkey PRIMARY KEY (type_id)
);                                                                                                                                                                                                                                                                                                                                                                                                       |
| profiles            | CREATE TABLE public.profiles (
  created_at timestamp with time zone NULL,
  id uuid NOT NULL,
  local_body_id text NOT NULL,
  role text NULL,
  CONSTRAINT profiles_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);                                                                                                                                                                                                                                                                                  |
| town                | CREATE TABLE public.town (
  meets_cleanliness_standards boolean NULL,
  town_name_en text NULL,
  town_name_ml text NULL,
  local_body_id text NULL,
  has_sufficient_bins boolean NULL,
  created_at timestamp with time zone NOT NULL,
  town_id uuid NOT NULL,
  has_proper_bin_usage boolean NULL,
  CONSTRAINT town_pkey PRIMARY KEY (town_id),
  CONSTRAINT town_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id)
);                                                                                                                             |
| ward                | CREATE TABLE public.ward (
  local_body_id text NULL,
  elected_member_ml text NULL,
  ward_name_ml text NULL,
  last_path_segment text NULL,
  role text NULL,
  party text NULL,
  reservation text NULL,
  ward_id text NOT NULL,
  ward_no text NULL,
  ward_name_en text NULL,
  elected_member_en text NULL,
  CONSTRAINT ward_pkey PRIMARY KEY (ward_id),
  CONSTRAINT ward_local_body_id_fkey FOREIGN KEY (local_body_id) REFERENCES local_body (local_body_id)
);                                                                                                                  |
| ward_collection     | CREATE TABLE public.ward_collection (
  collection_id integer NOT NULL,
  ward_id text NOT NULL,
  year_month date NOT NULL,
  rate numeric NOT NULL,
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (year_month),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (year_month),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (ward_id),
  CONSTRAINT ward_collection_ward_month_unique UNIQUE (ward_id),
  CONSTRAINT ward_collection_pkey PRIMARY KEY (collection_id),
  CONSTRAINT ward_collection_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES ward (ward_id)
); |