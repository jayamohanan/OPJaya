Task:
Synchronize dbSchema.js with the latest schema defined in supabase_schema.md.

Context:

supabase_schema.md lists all Supabase tables and their fields in Markdown format.

dbSchema.js contains two exported objects:

TABLES: constant mappings for table names

FIELDS: constant mappings for field names grouped by table

Example:

export const TABLES = {
  ASSEMBLY: 'assembly',
  DISTRICT: 'district',
};

export const FIELDS = {
  ASSEMBLY: {
    ID: 'assembly_id',
    NAME_EN: 'assembly_name_en',
  },
  DISTRICT: {
    ID: 'district_id',
    NAME_EN: 'district_name_en',
  },
};

✅ Goal

Keep dbSchema.js automatically synchronized with supabase_schema.md while preserving the code-facing reference keys.

⚙️ Instructions for Copilot

Parse supabase_schema.md to extract:

Table names

Column names (fields) for each table

Compare parsed data with the current contents of dbSchema.js.

Handle updates as follows:

🆕 New tables:

If a table exists in Supabase but not in TABLES, add it:

TABLES.NEW_TABLE = 'new_table';
FIELDS.NEW_TABLE = { /* all columns */ };


🆕 New fields (for existing tables):

Add any missing fields found in Supabase that are not in FIELDS[tableName].

Use uppercase snake case for the key (e.g., NEW_COLUMN) and the original column name (e.g., 'new_column') as the value.

🔁 Changed field names (renamed in Supabase):

If a column’s name in Supabase differs from the existing value in dbSchema.js but the reference key already exists,
→ update only the value (Supabase name),
→ do NOT change the key name used in code.
Example:

// Supabase renamed "assembly_name_en" → "name_en"
NAME_EN: 'assembly_name_en'  →  NAME_EN: 'name_en'


This ensures existing code references remain valid.

🚫 Deleted tables or fields:

Do not remove or modify existing keys — leave them untouched to avoid breaking existing code.

Maintain formatting and export structure in dbSchema.js.

Log all detected updates — new tables, new fields, and renamed columns.