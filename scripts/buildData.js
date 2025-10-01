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
    const { data: districts, error: districtError } = await supabase.from('district').select('*');
    if (districtError) throw districtError;
    
    console.log('📡 Fetching assemblies from Supabase...');
    const { data: assemblies, error: assemblyError } = await supabase.from('assembly').select('*');
    if (assemblyError) throw assemblyError;

    console.log('📡 Fetching district categories from Supabase...');
    const { data: districtCategories, error: districtCategoryError } = await supabase.from('district_category').select('*');
    if (districtCategoryError) throw districtCategoryError;

    console.log('📡 Fetching assembly categories from Supabase...');
    const { data: assemblyCategories, error: assemblyCategoryError } = await supabase.from('assembly_category').select('*');
    if (assemblyCategoryError) throw assemblyCategoryError;

    console.log(`✅ Found ${districts.length} districts and ${assemblies.length} assemblies`);

    // Create category lookup maps
    const districtCategoryMap = Object.fromEntries((districtCategories || []).map(dc => [dc.district_id, dc.category]));
    const assemblyCategoryMap = Object.fromEntries((assemblyCategories || []).map(ac => [ac.assembly_id, ac.category]));

    // Helper maps for fast lookup
    const districtMap = Object.fromEntries(districts.map(d => [d.district_id, d]));
    const assemblyMap = Object.fromEntries(assemblies.map(a => [a.assembly_id, a]));

    // For testing: limit to 10 items each
    const testDistricts = districts.slice(0, 10);
    const testAssemblies = assemblies.slice(0, 10);

    // For category demo: pick one per unique category
    function pickOnePerCategory(items, getCategory) {
      const seen = new Set();
      const result = [];
      for (const item of items) {
        const cat = getCategory(item);
        if (!seen.has(cat)) {
          seen.add(cat);
          result.push(item);
        }
      }
      return result;
    }

    // Pick one district per unique category
    const demoDistricts = pickOnePerCategory(districts, d => districtCategoryMap[d.district_id] || '');
    // Pick one assembly per unique category
    const demoAssemblies = pickOnePerCategory(assemblies, a => assemblyCategoryMap[a.assembly_id] || '');
    // Fetch local bodies and categories
    const { data: localBodies } = await supabase.from('local_body').select('*');
    const { data: localBodyCategories } = await supabase.from('local_body_category').select('*');
    const localBodyCategoryMap = Object.fromEntries((localBodyCategories || []).map(lc => [lc.local_body_id, lc.category]));
    // Pick one local body per unique category
    const demoLocalBodies = pickOnePerCategory(localBodies, l => localBodyCategoryMap[l.local_body_id] || '');

    // --- 1. State JSON (ACTIVE) ---
    console.log('🏗️  Generating state JSON...');
    const stateJSON = {
      state_id: 'kl',
      state_name_en: 'Kerala',
      state_name_ml: 'കേരളം',
      category: 'normal',
      districts: demoDistricts.map(d => ({
        district_id: d.district_id,
        district_name_en: d.district_name_en,
        district_name_ml: d.district_name_ml,
        category: districtCategoryMap[d.district_id] || ''
      })),
      geojson_links: {
        outline: 'geojson/states/outlines/kerala.geojson',
        districts: 'geojson/states/with-districts/kerala.geojson'
      }
    };
    await writeJSON(path.join(DATA_DIR, 'state.json'), stateJSON);

    // --- 2. District JSONs (one per category) ---
    console.log('🏗️  Generating district JSON files...');
    for (const d of demoDistricts) {
      const districtAssemblies = assemblies.filter(a => a.district_id === d.district_id);
      const districtJSON = {
        district_id: d.district_id,
        district_name_en: d.district_name_en,
        district_name_ml: d.district_name_ml,
        is_active: d.is_active !== false,
        category: districtCategoryMap[d.district_id] || '',
        assemblies: districtAssemblies.map(a => ({
          assembly_id: a.assembly_id,
          assembly_name_en: a.assembly_name_en,
          assembly_name_ml: a.assembly_name_ml,
          category: assemblyCategoryMap[a.assembly_id] || ''
        })),
        geojson_links: {
          outline: `geojson/districts/outlines/${toFilename(d.district_name_en)}.geojson`,
          assemblies: `geojson/districts/with-assemblies/${toFilename(d.district_name_en)}.geojson`
        }
      };
      await writeJSON(path.join(DISTRICTS_DIR, `${toFilename(d.district_name_en)}.json`), districtJSON);
    }

        // --- 3. Assembly JSONs (one per category) ---
    console.log('🏗️  Generating assembly JSON files...');
    for (const a of demoAssemblies) {
      const district = districtMap[a.district_id] || {};
      const assemblyLocalBodies = localBodies.filter(l => l.assembly_id === a.assembly_id);
      const assemblyJSON = {
        assembly_id: a.assembly_id,
        assembly_name_en: a.assembly_name_en,
        assembly_name_ml: a.assembly_name_ml,
        category: assemblyCategoryMap[a.assembly_id] || '',
        district: {
          district_id: district.district_id,
          district_name_en: district.district_name_en,
          district_name_ml: district.district_name_ml,
          district_category: districtCategoryMap[district.district_id] || ''
        },
        local_bodies: assemblyLocalBodies.map(l => ({
          local_body_id: l.local_body_id,
          local_body_name_en: l.local_body_name_en,
          local_body_name_ml: l.local_body_name_ml,
          category: localBodyCategoryMap[l.local_body_id] || ''
        })),
        geojson_links: {
          outline: `geojson/assemblies/outlines/${toFilename(a.assembly_name_en)}.geojson`,
          local_bodies: `geojson/assemblies/with-local-bodies/${toFilename(a.assembly_name_en)}.geojson`
        }
      };
      await writeJSON(path.join(ASSEMBLIES_DIR, `${toFilename(a.assembly_name_en)}.json`), assemblyJSON);
    }

        // --- 4. Local Body JSONs (one per category) ---
    console.log('🏗️  Generating local body JSON files...');
    const { data: localBodyTypes } = await supabase.from('local_body_type').select('*');
    const { data: wards, error: wardsError } = await supabase.from('ward').select('*');
    if (wardsError) throw wardsError;
    console.log('Fetched wards:', wards.length); // Add this line
    const { data: towns } = await supabase.from('town').select('*');
    const { data: issues } = await supabase.from('issues').select('*');
    const { data: wardCollections } = await supabase.from('ward_collection').select('*');
    
    const localBodyTypeMap = Object.fromEntries((localBodyTypes || []).map(t => [t.type_id, t]));

    for (const l of demoLocalBodies) {
        console.log('l.local_body_id ', l.local_body_id);
      const type = localBodyTypeMap[l.type_id] || {};
      const assembly = assemblyMap[l.assembly_id] || {};
      const district = districtMap[assembly.district_id] || {};
      console.log('4444555555wards.length:', wards.length);
      const lbWardsWithBasicInfo = wards
        .filter(w => w.local_body_id === l.local_body_id)
        .map(w => ({
          ward_id: w.ward_id,
          ward_no: w.ward_no || '',
          ward_name_en: w.ward_name_en || '',
          ward_name_ml: w.ward_name_ml || ''
        }));
      const lbTowns = towns.filter(t => t.local_body_id === l.local_body_id);
      const lbTownsArr = lbTowns.map(t => ({
        town_name_en: t.town_name_en,
        town_name_ml: t.town_name_ml
      }));
      const lbIssues = issues.filter(i => i.local_body_id === l.local_body_id);
      const issuesByType = {};
      for (const issueType of ['town', 'bus_stop', 'water_body']) {
        issuesByType[issueType] = lbIssues.filter(i => i.type === issueType);
      }
      const localBodyJSON = {
        local_body_id: l.local_body_id,
        local_body_name_en: l.local_body_name_en,
        local_body_name_ml: l.local_body_name_ml,
        local_body_type_en: type.type_name_en || '',
        local_body_type_ml: type.type_name_ml || '',
        category: localBodyCategoryMap[l.local_body_id] || '',
        assembly: {
          assembly_id: assembly.assembly_id,
          assembly_name_en: assembly.assembly_name_en,
          assembly_name_ml: assembly.assembly_name_ml,
          category: assemblyCategoryMap[assembly.assembly_id] || ''
        },
        district: {
          district_id: district.district_id,
          district_name_en: district.district_name_en,
          district_name_ml: district.district_name_ml,
          category: districtCategoryMap[district.district_id] || ''
        },
        wards: lbWardsWithBasicInfo,
        towns: lbTownsArr,
        issues: issuesByType,
        geojson_links: {
          outline: `geojson/local-bodies/outlines/${toFilename(l.local_body_name_en)}.geojson`
        }
      };
      await writeJSON(path.join(LOCAL_BODIES_DIR, `${toFilename(l.local_body_name_en)}.json`), localBodyJSON);
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
    console.log(`   - ${testDistricts.length} district files in: public/data/districts/`);
    console.log(`   - ${testAssemblies.length} assembly files in: public/data/assemblies/`);
    console.log(`   - 10 local body files in: public/data/local_bodies/`);
    console.log('📋 District files created:');
    for (const d of testDistricts) {
      console.log(`   - ${toFilename(d.district_name_en)}.json (${d.district_name_en})`);
    }
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
