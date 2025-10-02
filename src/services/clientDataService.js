// src/services/clientDataService.js
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { 
  mapLocalBodyData, 
  mapAssemblyData, 
  mapDistrictData, 
  mapWardData, 
  mapIssueData, 
  mapTownData,
  mapWardCollectionData
} from '../utils/dataMapper';

// Set this flag to true to use Supabase, false to use static JSON files
const USE_SUPABASE = true;

// --- State Data ---
export async function getStateData() {
  if (USE_SUPABASE) {
    // Fetch all districts
    const { data: districtData, error: districtError } = await supabase
      .from(TABLES.DISTRICT)
      .select([
        FIELDS.DISTRICT.ID,
        FIELDS.DISTRICT.NAME_EN,
        FIELDS.DISTRICT.NAME_ML
      ].join(', '));
    if (districtError) throw districtError;

    // Fetch district categories
    const { data: catData, error: catError } = await supabase
      .from('district_category')
      .select('district_id, category');
    if (catError) throw catError;

    // Map categories to districts
    const categoryMap = {};
    (catData || []).forEach(cat => {
      categoryMap[cat.district_id] = cat.category;
    });

    return {
      districts: (districtData || []).map(d => ({
        district_id: d[FIELDS.DISTRICT.ID],
        district_name_en: d[FIELDS.DISTRICT.NAME_EN],
        district_name_ml: d[FIELDS.DISTRICT.NAME_ML],
        category: categoryMap[d[FIELDS.DISTRICT.ID]] || 'Normal'
      }))
    };
  } else {
    const res = await fetch('/data/state.json');
    if (!res.ok) throw new Error('State JSON not found');
    return await res.json();
  }
}

// --- District Data ---
export async function getDistrictData(districtId) {
  if (USE_SUPABASE) {
    const { data: districtData, error: districtError } = await supabase
      .from(TABLES.DISTRICT)
      .select([
        '*',
        `${TABLES.DISTRICT_CATEGORY}(*)`
      ].join(', '))
      .eq(FIELDS.DISTRICT.ID, districtId)
      .single();
    if (districtError) throw districtError;
    return mapDistrictData(districtData);
  } else {
    const res = await fetch(`/data/districts/${districtId}.json`);
    if (!res.ok) throw new Error('District JSON not found');
    return await res.json();
  }
}

export async function getAssembliesForDistrict(districtId) {
  if (USE_SUPABASE) {
    const { data: asms, error: asmError } = await supabase
      .from(TABLES.ASSEMBLY)
      .select([
        '*',
        `${TABLES.ASSEMBLY_CATEGORY}(*)`
      ].join(', '))
      .eq(FIELDS.ASSEMBLY.DISTRICT_ID, districtId);
    if (asmError) throw asmError;
    return (asms || []).map(mapAssemblyData);
  } else {
    const districtData = await getDistrictData(districtId);
    return districtData.assemblies || [];
  }
}

// --- Assembly Data ---
export async function getAssemblyData(assemblyId) {
  if (USE_SUPABASE) {
    const { data: assemblyData, error: assemblyError } = await supabase
      .from(TABLES.ASSEMBLY)
      .select([
        '*',
        `${TABLES.ASSEMBLY_CATEGORY}(*)`
      ].join(', '))
      .eq(FIELDS.ASSEMBLY.ID, assemblyId)
      .single();
    if (assemblyError) throw assemblyError;
    return mapAssemblyData(assemblyData);
  } else {
    const res = await fetch(`/data/assemblies/${assemblyId}.json`);
    if (!res.ok) throw new Error('Assembly JSON not found');
    return await res.json();
  }
}

export async function getLocalBodiesForAssembly(assemblyId) {
  if (USE_SUPABASE) {
    const { data: lbs, error: lbError } = await supabase
      .from(TABLES.LOCAL_BODY)
      .select([
        '*',
        `${TABLES.LOCAL_BODY_CATEGORY}(*)`,
        `${TABLES.LOCAL_BODY_TYPE}(*)`
      ].join(', '))
      .eq(FIELDS.LOCAL_BODY.ASSEMBLY_ID, assemblyId);
    if (lbError) throw lbError;
    return (lbs || []).map(mapLocalBodyData);
  } else {
    const assemblyData = await getAssemblyData(assemblyId);
    return assemblyData.local_bodies || [];
  }
}

// --- Local Body Data ---
export async function getLocalBodyData(localBodyId) {
  if (USE_SUPABASE) {
    const { data: localBodyData, error: localBodyError } = await supabase
      .from(TABLES.LOCAL_BODY)
      .select([
        '*',
        `${TABLES.LOCAL_BODY_TYPE}(*)`,
        `${TABLES.LOCAL_BODY_CATEGORY}(*)`
      ].join(', '))
      .eq(FIELDS.LOCAL_BODY.ID, localBodyId)
      .single();
    if (localBodyError) throw localBodyError;
    return localBodyData;
  } else {
    const res = await fetch(`/data/local_bodies/${localBodyId}.json`);
    if (!res.ok) throw new Error('Local Body JSON not found');
    return await res.json();
  }
}

export async function getLocalBodyDetails(localBodyId) {
  if (USE_SUPABASE) {
    const { data: localBodyData, error: localBodyError } = await supabase
      .from(TABLES.LOCAL_BODY)
      .select([
        FIELDS.LOCAL_BODY.ID,
        FIELDS.LOCAL_BODY.NAME_EN,
        FIELDS.LOCAL_BODY.NAME_ML,
        FIELDS.LOCAL_BODY.TYPE_ID,
        FIELDS.LOCAL_BODY.ASSEMBLY_ID,
        `${TABLES.LOCAL_BODY_TYPE}(${FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN}, ${FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML})`
      ].join(', '))
      .eq(FIELDS.LOCAL_BODY.ID, localBodyId)
      .single();
    if (localBodyError) throw localBodyError;
    return localBodyData;
  } else {
    return await getLocalBodyData(localBodyId);
  }
}

export async function getAssemblyDetails(assemblyId) {
  if (USE_SUPABASE) {
    const { data: assemblyData, error: assemblyError } = await supabase
      .from(TABLES.ASSEMBLY)
      .select([
        FIELDS.ASSEMBLY.ID,
        FIELDS.ASSEMBLY.NAME_EN,
        FIELDS.ASSEMBLY.NAME_ML,
        FIELDS.ASSEMBLY.DISTRICT_ID
      ].join(', '))
      .eq(FIELDS.ASSEMBLY.ID, assemblyId)
      .single();
    if (assemblyError) throw assemblyError;
    return assemblyData;
  } else {
    return await getAssemblyData(assemblyId);
  }
}

export async function getDistrictDetails(districtId) {
  if (USE_SUPABASE) {
    const { data: districtData, error: districtError } = await supabase
      .from(TABLES.DISTRICT)
      .select([
        FIELDS.DISTRICT.ID,
        FIELDS.DISTRICT.NAME_EN,
        FIELDS.DISTRICT.NAME_ML
      ].join(', '))
      .eq(FIELDS.DISTRICT.ID, districtId)
      .single();
    if (districtError) throw districtError;
    return districtData;
  } else {
    return await getDistrictData(districtId);
  }
}

// --- Assembly List Page Data ---
export async function getAllDistrictsData() {
  if (USE_SUPABASE) {
    const { data: districtData } = await supabase
      .from(TABLES.DISTRICT)
      .select([
        '*',
        `${TABLES.DISTRICT_CATEGORY}(*)`
      ].join(', '));
    return (districtData || []).map(mapDistrictData);
  } else {
    const stateData = await getStateData();
    return stateData.districts || [];
  }
}

export async function getAllAssembliesData() {
  if (USE_SUPABASE) {
    const { data: assemblyData } = await supabase
      .from(TABLES.ASSEMBLY)
      .select([
        '*',
        `${TABLES.ASSEMBLY_CATEGORY}(*)`
      ].join(', '));
    return (assemblyData || []).map(mapAssemblyData);
  } else {
    // For JSON mode, we'd need to aggregate from all district JSONs
    // This is more complex and might require an index file
    throw new Error('getAllAssembliesData not implemented for JSON mode');
  }
}

export async function getAllLocalBodiesData() {
  if (USE_SUPABASE) {
    const { data: localBodyData } = await supabase
      .from(TABLES.LOCAL_BODY)
      .select([
        '*',
        `${TABLES.LOCAL_BODY_CATEGORY}(*)`,
        `${TABLES.LOCAL_BODY_TYPE}(*)`
      ].join(', '));
      console.log('qqqqqqqqqqqqqqFetched local body data:', localBodyData);
    // return (localBodyData || []).map(mapLocalBodyData);
    return  localBodyData || [];
  } else {
    // For JSON mode, we'd need to aggregate from all assembly JSONs
    throw new Error('getAllLocalBodiesData not implemented for JSON mode');
  }
}

export async function getLocalBodyCategories() {
  if (USE_SUPABASE) {
    const { data: localBodyCategoryData } = await supabase
      .from('local_body_category')
      .select(`${FIELDS.LOCAL_BODY_CATEGORY.LOCAL_BODY_ID}, ${FIELDS.LOCAL_BODY_CATEGORY.CATEGORY}`);
    return localBodyCategoryData || [];
  } else {
    // Categories are included in the individual JSON files
    return [];
  }
}

// Function to get wards for a local body
export async function getWardsForLocalBody(localBodyId) {
  console.log('************getWardsForLocalBody called with localBodyId:', localBodyId);
  if (!USE_SUPABASE) {
    throw new Error('Static data service not implemented for wards');
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLES.WARD)
      .select('*')
      .eq(FIELDS.WARD.LOCAL_BODY_ID, localBodyId);

    if (error) {
      console.error('Error fetching wards for local body:', error);
      return [];
    }

    return (data || []).map(mapWardData);
  } catch (error) {
    console.error('Error in getWardsForLocalBody:', error);
    return [];
  }
}

// Function to get ward collection rates for HKS
export async function getWardCollectionRates(wardIds) {
  if (!USE_SUPABASE) {
    throw new Error('Static data service not implemented for ward collection rates');
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLES.WARD_COLLECTION)
      .select('*')
      .in(FIELDS.WARD_COLLECTION.WARD_ID, wardIds);

    if (error) {
      console.error('Error fetching ward collection rates:', error);
      return [];
    }

    return (data || []).map(mapWardCollectionData);
  } catch (error) {
    console.error('Error in getWardCollectionRates:', error);
    return [];
  }
}

// Function to get issues for a local body
export async function getIssuesForLocalBody(localBodyId) {
  if (!USE_SUPABASE) {
    throw new Error('Static data service not implemented for issues');
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLES.ISSUES)
      .select('*')
      .eq(FIELDS.ISSUES.LOCAL_BODY_ID, localBodyId);

    if (error) {
      console.error('Error fetching issues for local body:', error);
      return [];
    }

    return (data || []).map(mapIssueData);
  } catch (error) {
    console.error('Error in getIssuesForLocalBody:', error);
    return [];
  }
}

// Function to get towns for a local body
export async function getTownsForLocalBody(localBodyId) {
  if (!USE_SUPABASE) {
    throw new Error('Static data service not implemented for towns');
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLES.TOWN)
      .select('*')
      .eq(FIELDS.TOWN.LOCAL_BODY_ID, localBodyId);

    if (error) {
      console.error('Error fetching towns for local body:', error);
      return [];
    }

    return (data || []).map(mapTownData);
  } catch (error) {
    console.error('Error in getTownsForLocalBody:', error);
    return [];
  }
}

// Function to update ward collection rates
export async function updateWardCollectionRates(rates) {
  if (!USE_SUPABASE) {
    throw new Error('Static data service not implemented for updating ward collection rates');
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLES.WARD_COLLECTION)
      .upsert(rates, { onConflict: ['ward_id', 'year_month'] });

    if (error) {
      console.error('Error updating ward collection rates:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateWardCollectionRates:', error);
    throw error;
  }
}
