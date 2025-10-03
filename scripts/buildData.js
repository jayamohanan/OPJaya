#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

/**
 * buildData.js
 * Fetches all data from Supabase and generates static JSON files for state, districts, assemblies, local bodies, and index.
 * Output: public/data/
 * 
 * CURRENT: Generating STATE, 10 DISTRICTS, 10 ASSEMBLIES, 10 LOCAL BODIES for testing
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { TABLES, FIELDS } = require('../src/constants/dbSchema');

// --- CONFIG ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Checking environment variables...');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  console.error('   Set them in .env file or as environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const DISTRICTS_DIR = path.join(DATA_DIR, 'districts');
const ASSEMBLIES_DIR = path.join(DATA_DIR, 'assemblies');
const LOCAL_BODIES_DIR = path.join(DATA_DIR, 'local_bodies');

// --- HELPERS ---
async function writeJSON(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Created: ${path.relative(process.cwd(), filePath)}`);
}

// Helper function to convert names to web-safe lowercase filenames
function toFilename(name) {
  if (!name || typeof name !== 'string') return 'unknown';
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, '')    // Remove special characters except hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
}

// --- MAIN ---
(async () => {
  console.log('🚀 Starting data generation (STATE + 10 DISTRICTS + 10 ASSEMBLIES + 10 LOCAL BODIES)...');
  
  try {
    // 1. Fetch required data for districts
    console.log('📡 Fetching districts from Supabase...');
    const { data: districts, error: districtError } = await supabase.from(TABLES.DISTRICT).select('*');
    if (districtError) throw districtError;
    
    console.log('📡 Fetching assemblies from Supabase...');
    const { data: assemblies, error: assemblyError } = await supabase.from(TABLES.ASSEMBLY).select('*');
    if (assemblyError) throw assemblyError;

    console.log('📡 Fetching district categories from Supabase...');
    const { data: districtCategories, error: districtCategoryError } = await supabase.from(TABLES.DISTRICT_CATEGORY).select('*');
    if (districtCategoryError) throw districtCategoryError;

    console.log('📡 Fetching assembly categories from Supabase...');
    const { data: assemblyCategories, error: assemblyCategoryError } = await supabase.from(TABLES.ASSEMBLY_CATEGORY).select('*');
    if (assemblyCategoryError) throw assemblyCategoryError;

    console.log(`✅ Found ${districts.length} districts and ${assemblies.length} assemblies`);

    // Create category lookup maps
    const districtCategoryMap = Object.fromEntries((districtCategories || []).map(dc => [dc[FIELDS.DISTRICT_CATEGORY.DISTRICT_ID], dc[FIELDS.DISTRICT_CATEGORY.CATEGORY]]));
    const assemblyCategoryMap = Object.fromEntries((assemblyCategories || []).map(ac => [ac[FIELDS.ASSEMBLY_CATEGORY.ASSEMBLY_ID], ac[FIELDS.ASSEMBLY_CATEGORY.CATEGORY]]));

    // Helper maps for fast lookup
    const districtMap = Object.fromEntries(districts.map(d => [d[FIELDS.DISTRICT.ID], d]));
    const assemblyMap = Object.fromEntries(assemblies.map(a => [a[FIELDS.ASSEMBLY.ID], a]));

  // Remove all test/demo limits: use all districts, assemblies, and local bodies
  const allDistricts = districts;
  const allAssemblies = assemblies;
    // Fetch all local bodies in batches (Supabase 1000 row limit workaround)
    async function fetchAllLocalBodies(batchSize = 1000) {
      let allLocalBodies = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from('local_body')
          .select('*')
          .range(from, from + batchSize - 1);
        if (error) throw error;
        if (!data.length) break;
        allLocalBodies = allLocalBodies.concat(data);
        from += batchSize;
        if (data.length < batchSize) break;
      }
      return allLocalBodies;
    }
    const allLocalBodies = await fetchAllLocalBodies();
    const { data: localBodyCategories } = await supabase.from('local_body_category').select('*');
    const localBodyCategoryMap = Object.fromEntries((localBodyCategories || []).map(lc => [lc.local_body_id, lc.category]));

    // --- 1. State JSON (ALL) ---
    console.log('🏗️  Generating state JSON...');
    const stateJSON = {
      id: 'kl',
      name_en: 'Kerala',
      name_ml: 'കേരളം',
      category: 'normal',
      districts: allDistricts.map(d => ({
        id: d.id,
        name_en: d.name_en,
        name_ml: d.name_ml,
        is_active: d.is_active !== false,
        district_category: districtCategoryMap[d.id] ? { category: districtCategoryMap[d.id] } : null
      })),
      geojson_links: {
        outline: 'geojson/states/outlines/kerala.geojson',
        districts: 'geojson/states/with-districts/kerala.geojson'
      }
    };
    await writeJSON(path.join(DATA_DIR, 'state.json'), stateJSON);

    // --- 2. District JSONs (ALL) ---
    console.log('🏗️  Generating district JSON files...');
    for (const d of allDistricts) {
      const districtAssemblies = allAssemblies.filter(a => a.district_id === d.id);
      const districtJSON = {
        id: d.id,
        name_en: d.name_en,
        name_ml: d.name_ml,
        is_active: d.is_active !== false,
        district_category: districtCategoryMap[d.id] ? { category: districtCategoryMap[d.id] } : null,
        assemblies: districtAssemblies.map(a => ({
          id: a.id,
          name_en: a.name_en,
          name_ml: a.name_ml,
          assembly_category: assemblyCategoryMap[a.id] ? { category: assemblyCategoryMap[a.id] } : null
        })),
        geojson_links: {
          outline: `geojson/districts/outlines/${toFilename(d.name_en)}.geojson`,
          assemblies: `geojson/districts/with-assemblies/${toFilename(d.name_en)}.geojson`
        }
      };
      await writeJSON(path.join(DISTRICTS_DIR, `${d.id}.json`), districtJSON);
    }

    // --- 3. Assembly JSONs (ALL) ---
    console.log('🏗️  Generating assembly JSON files...');
    for (const a of allAssemblies) {
      const district = districtMap[a.district_id] || {};
      const assemblyLocalBodies = allLocalBodies.filter(l => l.assembly_id === a.id);
      const assemblyJSON = {
        id: a.id,
        name_en: a.name_en,
        name_ml: a.name_ml,
        district_id: a.district_id,
        is_active: a.is_active !== false,
        assembly_category: assemblyCategoryMap[a.id] ? { category: assemblyCategoryMap[a.id] } : null,
        district: {
          id: district.id,
          name_en: district.name_en,
          name_ml: district.name_ml,
          district_category: districtCategoryMap[district.id] ? { category: districtCategoryMap[district.id] } : null
        },
        local_bodies: assemblyLocalBodies.map(l => ({
          id: l.id,
          name_en: l.name_en,
          name_ml: l.name_ml,
          local_body_category: localBodyCategoryMap[l.id] ? { category: localBodyCategoryMap[l.id] } : null
        })),
        geojson_links: {
          outline: `geojson/assemblies/outlines/${toFilename(a.name_en)}.geojson`,
          local_bodies: `geojson/assemblies/with-local-bodies/${toFilename(a.name_en)}.geojson`
        }
      };
      await writeJSON(path.join(ASSEMBLIES_DIR, `${a.id}.json`), assemblyJSON);
    }

    // --- 4. Local Body JSONs (ALL) ---
    console.log('🏗️  Generating local body JSON files...');
    const { data: localBodyTypes } = await supabase.from('local_body_type').select('*');
    // --- Fetch all wards in batches (Supabase 1000 row limit workaround) ---
    async function fetchAllWards(batchSize = 1000) {
      let allWards = [];
      let from = 0;
      let to = batchSize - 1;
      let keepGoing = true;
      while (keepGoing) {
        const { data: batch, error } = await supabase.from('ward').select('*').range(from, to);
        if (error) throw error;
        if (!batch || batch.length === 0) break;
        allWards = allWards.concat(batch);
        if (batch.length < batchSize) break;
        from += batchSize;
        to += batchSize;
      }
      return allWards;
    }
    const wards = await fetchAllWards();
    const { data: towns } = await supabase.from('town').select('*');
    const { data: issues } = await supabase.from('issues').select('*');
    
    // --- Fetch all ward collections in batches (Supabase 1000 row limit workaround) ---
    async function fetchAllWardCollections(batchSize = 1000) {
      let allWardCollections = [];
      let from = 0;
      console.log('📡 Fetching ward collections in batches...');
      while (true) {
        const { data: batch, error } = await supabase
          .from('ward_collection')
          .select('*')
          .range(from, from + batchSize - 1);
        if (error) throw error;
        if (!batch || batch.length === 0) break;
        allWardCollections = allWardCollections.concat(batch);
        console.log(`📡 Fetched ${allWardCollections.length} ward collections so far...`);
        from += batchSize;
        if (batch.length < batchSize) break;
      }
      console.log(`✅ Total ward collections fetched: ${allWardCollections.length}`);
      return allWardCollections;
    }
    const wardCollections = await fetchAllWardCollections();
    
    const localBodyTypeMap = Object.fromEntries((localBodyTypes || []).map(t => [t.id, t]));

    for (const l of allLocalBodies) {
      const type = localBodyTypeMap[l.local_body_type_id] || {};
      const assembly = assemblyMap[l.assembly_id] || {};
      const district = districtMap[assembly.district_id] || {};
      
      // Debug logging for G090107
      if (l.id === 'G090107') {
        console.log(`🔍 DEBUG: Processing local body ${l.id} (${l.name_en})`);
        console.log(`🔍 DEBUG: Total ward collections in database: ${wardCollections?.length || 0}`);
      }
      
      const lbWardsWithBasicInfo = wards
        .filter(w => w.local_body_id === l.id)
        .map(w => {
          // Find the latest collection for this ward
          const collections = (wardCollections || []).filter(c => c.ward_id === w.id);
          // Sort by year_month descending and pick the first (latest)
          const sorted = collections
            .filter(c => c.year_month)
            .sort((a, b) => b.year_month.localeCompare(a.year_month));
          const latest = sorted[0] || null;
          return {
            id: w.id,
            ward_no: w.ward_no || '',
            name_en: w.name_en || '',
            name_ml: w.name_ml || '',
            ward_collection: latest ? {
              collection_id: latest.collection_id,
              ward_id: latest.ward_id,
              year_month: latest.year_month,
              rate: latest.rate
            } : null
          };
        });
      const lbTowns = towns.filter(t => t.local_body_id === l.id);
      const lbTownsArr = lbTowns.map(t => ({
        name_en: t.name_en,
        name_ml: t.name_ml
      }));
      const lbIssues = issues.filter(i => i.local_body_id === l.id);
      const issuesByType = {};
      for (const issueType of ['town', 'bus_stop', 'water_body']) {
        const filtered = lbIssues.filter(i => i.type === issueType);
        if (issueType === 'town') {
          // Group town issues by town name (from town table)
          const grouped = {};
          for (const issue of filtered) {
            const townId = issue.town_id || 'unknown';
            // Find town name from towns array
            const townObj = towns.find(t => t.id === townId);
            const townNameEn = townObj ? townObj.name_en : 'Unknown';
            const townNameMl = townObj ? townObj.name_ml : 'അജ്ഞാതം';
            // Add town name fields to each issue
            const issueWithTownName = {
              ...issue,
              town_name_en: townNameEn,
              town_name_ml: townNameMl
            };
            if (!grouped[townNameEn]) grouped[townNameEn] = [];
            grouped[townNameEn].push(issueWithTownName);
          }
          issuesByType[issueType] = grouped;
        } else {
          issuesByType[issueType] = filtered;
        }
      }
      const localBodyJSON = {
        id: l.id,
        name_en: l.name_en,
        name_ml: l.name_ml,
        assembly_id: l.assembly_id,
        local_body_type_id: l.local_body_type_id,
        local_body_type: {
          id: type.id,
          name_en: type.name_en || '',
          name_ml: type.name_ml || ''
        },
        local_body_category: localBodyCategoryMap[l.id] ? { category: localBodyCategoryMap[l.id] } : null,
        assembly: {
          id: assembly.id,
          name_en: assembly.name_en,
          name_ml: assembly.name_ml,
          assembly_category: assemblyCategoryMap[assembly.id] ? { category: assemblyCategoryMap[assembly.id] } : null
        },
        district: {
          id: district.id,
          name_en: district.name_en,
          name_ml: district.name_ml,
          district_category: districtCategoryMap[district.id] ? { category: districtCategoryMap[district.id] } : null
        },
        wards: lbWardsWithBasicInfo,
        towns: lbTownsArr,
        issues: issuesByType,
        geojson_links: {
          outline: `geojson/local-bodies/outlines/${toFilename(l.name_en)}.geojson`
        }
      };
      await writeJSON(path.join(LOCAL_BODIES_DIR, `${l.id}.json`), localBodyJSON);
    }

    // --- COMMENTED OUT: Index JSON ---
    /*
    console.log('🏗️  Generating index JSON...');
    const indexJSON = {
      districts: districts.map(d => ({
        district_id: d.district_id,
        district_name_en: d.district_name_en,
        district_name_ml: d.district_name_ml,
        category: d.category || ''
      })),
      assemblies: assemblies.map(a => ({
        assembly_id: a.assembly_id,
        assembly_name_en: a.assembly_name_en,
        assembly_name_ml: a.assembly_name_ml,
        district_id: a.district_id,
        category: a.category || ''
      })),
      local_bodies: localBodies.map(l => ({
        local_body_id: l.local_body_id,
        local_body_name_en: l.local_body_name_en,
        local_body_name_ml: l.local_body_name_ml,
        assembly_id: l.assembly_id,
        district_id: (assemblyMap[l.assembly_id] || {}).district_id,
        category: l.category || ''
      }))
    };
    await writeJSON(path.join(DATA_DIR, 'index.json'), indexJSON);
    */

    console.log('\n🎉 JSON generation completed!');
    console.log(`📁 Generated files:`);
  console.log(`   - state.json (Kerala State)`);
  console.log(`   - ${allDistricts.length} district files in: public/data/districts/`);
  console.log(`   - ${allAssemblies.length} assembly files in: public/data/assemblies/`);
  console.log(`   - ${allLocalBodies.length} local body files in: public/data/local_bodies/`);
    console.log('\n📝 Next steps:');
    console.log('   1. Check the generated files in public/data/');
    console.log('   2. Verify the JSON structure is correct');
    console.log('   3. Test with your React app frontend');
    console.log('   4. Scale up to generate all files when ready');

  } catch (error) {
    console.error('❌ Error generating data:', error);
    process.exit(1);
  }
})();
