// src/services/clientDataService.js
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';

// Set this flag to true to use Supabase, false to use static JSON files
const USE_SUPABASE = false;

// --- State Data ---
export async function getStateData() {
  if (USE_SUPABASE) {
    // Fetch all districts with nested categories
    const { data: districtData, error: districtError } = await supabase
      .from(TABLES.DISTRICT)
      .select([
        '*',
        `${TABLES.DISTRICT_CATEGORY}(*)`
      ].join(', '));
    if (districtError) throw districtError;
    const result = { districts: districtData || [] };
    console.log('-------getStateData', result);
    return result;
  } else {
    const res = await fetch('/data/state.json');
    if (!res.ok) throw new Error('State JSON not found');
    const stateJson = await res.json();
    return stateJson.districts || [];
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
    console.log('-------getDistrictData', districtData);
    return districtData;
  } else {
    const res = await fetch(`/data/districts/${districtId}.json`);
    if (!res.ok) throw new Error('District JSON not found');
    const districtJson = await res.json();
    console.log([TABLES.DISTRICT_CATEGORY]);
    return {
      [FIELDS.DISTRICT.ID]: districtJson[FIELDS.DISTRICT.ID],
      [FIELDS.DISTRICT.IS_ACTIVE]: districtJson[FIELDS.DISTRICT.IS_ACTIVE],
      [FIELDS.DISTRICT.NAME_EN]: districtJson[FIELDS.DISTRICT.NAME_EN],
      [FIELDS.DISTRICT.NAME_ML]: districtJson[FIELDS.DISTRICT.NAME_ML],
      [TABLES.DISTRICT_CATEGORY]: districtJson[TABLES.DISTRICT_CATEGORY] ? { category: districtJson[TABLES.DISTRICT_CATEGORY][FIELDS.DISTRICT_CATEGORY.CATEGORY] } : null
    };
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
    console.log('-------getAssembliesForDistrict', asms || []);
    return asms || [];
  } else {
    const res = await fetch(`/data/districts/${districtId}.json`);
    if (!res.ok) throw new Error('District JSON not found');
    const districtJson = await res.json();
    return districtJson.assemblies || [];
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
    console.log('-------getAssemblyData', assemblyData);
    return assemblyData;
  } else {
    const res = await fetch(`/data/assemblies/${assemblyId}.json`);
    if (!res.ok) throw new Error('Assembly JSON not found');
    const assemblyJson = await res.json();
    return {
      [FIELDS.ASSEMBLY.ID]: assemblyJson[FIELDS.ASSEMBLY.ID],
      [FIELDS.ASSEMBLY.DISTRICT_ID]: assemblyJson[FIELDS.ASSEMBLY.DISTRICT_ID],
      [FIELDS.ASSEMBLY.IS_ACTIVE]: assemblyJson[FIELDS.ASSEMBLY.IS_ACTIVE],
      [FIELDS.ASSEMBLY.NAME_EN]: assemblyJson[FIELDS.ASSEMBLY.NAME_EN],
      [FIELDS.ASSEMBLY.NAME_ML]: assemblyJson[FIELDS.ASSEMBLY.NAME_ML],
      [TABLES.ASSEMBLY_CATEGORY]: assemblyJson[TABLES.ASSEMBLY_CATEGORY] ? { category: assemblyJson[TABLES.ASSEMBLY_CATEGORY][FIELDS.ASSEMBLY_CATEGORY.CATEGORY] } : null
    };
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
    console.log('-------getLocalBodiesForAssembly', lbs || []);
    return lbs || [];
  } else {
    const res = await fetch(`/data/assemblies/${assemblyId}.json`);
    if (!res.ok) throw new Error('Assembly JSON not found');
    const assemblyJson = await res.json();
    return assemblyJson.local_bodies || [];
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
    console.log('-------getLocalBodyData', localBodyData);
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
    console.log('-------getLocalBodyDetails', localBodyData);
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
    console.log('-------getAssemblyDetails', assemblyData);
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
    console.log('-------getDistrictDetails', districtData);
    return districtData;
  } else {
    return await getDistrictData(districtId);
  }
}

// ----------------------------------------------- Assembly List Page Data -----------------------------------------------
export async function getAllDistrictsData() {
  if (USE_SUPABASE) {
    const { data: districtData } = await supabase
      .from(TABLES.DISTRICT)
      .select([
        '*',
        `${TABLES.DISTRICT_CATEGORY}(*)`
      ].join(', '));
    console.log('-------getAllDistrictsData', districtData || []);
    return districtData || [];
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
    console.log('-------getAllAssembliesData', assemblyData || []);
    return assemblyData || [];
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
    console.log('-------getAllLocalBodiesData', localBodyData || []);
    return  localBodyData || [];
  } else {
    // For JSON mode, we'd need to aggregate from all assembly JSONs
    throw new Error('getAllLocalBodiesData not implemented for JSON mode');
  }
}
//in doubt
export async function getLocalBodyCategories() {
  if (USE_SUPABASE) {
    const { data: localBodyCategoryData } = await supabase
      .from('local_body_category')
      .select(`${FIELDS.LOCAL_BODY_CATEGORY.LOCAL_BODY_ID}, ${FIELDS.LOCAL_BODY_CATEGORY.CATEGORY}`);
    console.log('-------getLocalBodyCategories', localBodyCategoryData || []);
    return localBodyCategoryData || [];
  } else {
    // Categories are included in the individual JSON files
    return [];
  }
}

// Function to get wards for a local body
export async function getWardsForLocalBody(localBodyId) {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARD)
        .select('*')
        .eq(FIELDS.WARD.LOCAL_BODY_ID, localBodyId);

      if (error) {
        console.error('Error fetching wards for local body:', error);
        return [];
      }

      console.log('-------getWardsForLocalBody', data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getWardsForLocalBody:', error);
      return [];
    }
  } else {
    try {
      const localBodyData = await getLocalBodyData(localBodyId);
      return localBodyData.wards || [];
    } catch (error) {
      console.error('Error fetching wards from local body JSON:', error);
      return [];
    }
  }
}

// Function to get ward collection rates for HKS
export async function getWardCollectionRates(wardIds) {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARD_COLLECTION)
        .select('*')
        .in(FIELDS.WARD_COLLECTION.WARD_ID, wardIds);

      if (error) {
        console.error('Error fetching ward collection rates:', error);
        return [];
      }

      console.log('-------getWardCollectionRates', data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getWardCollectionRates:', error);
      return [];
    }
  } else {
    return [];
  }
}

// Function to get issues for a local body
export async function getIssuesForLocalBody(localBodyId) {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ISSUES)
        .select('*')
        .eq(FIELDS.ISSUES.LOCAL_BODY_ID, localBodyId);

      if (error) {
        console.error('Error fetching issues for local body:', error);
        return [];
      }

      console.log('-------getIssuesForLocalBody', data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getIssuesForLocalBody:', error);
      return [];
    }
  } else {
    try {
      const localBodyData = await getLocalBodyData(localBodyId);
      return localBodyData.issues || {};
    } catch (error) {
      console.error('Error fetching issues from local body JSON:', error);
      return {};
    }
  }
}

export async function getTownsForLocalBody(localBodyId) {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOWN)
        .select('*')
        .eq(FIELDS.TOWN.LOCAL_BODY_ID, localBodyId);

      if (error) {
        console.error('Error fetching towns for local body:', error);
        return [];
      }

      console.log('-------getTownsForLocalBody', data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getTownsForLocalBody:', error);
      return [];
    }
  } else {
    try {
      const localBodyData = await getLocalBodyData(localBodyId);
      return localBodyData.towns || [];
    } catch (error) {
      console.error('Error fetching towns from local body JSON:', error);
      return [];
    }
  }
}

// Function to update ward collection rates
export async function updateWardCollectionRates(rates) {
  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARD_COLLECTION)
        .upsert(rates, { onConflict: ['ward_id', 'year_month'] });

      if (error) {
        console.error('Error updating ward collection rates:', error);
        throw error;
      }

      console.log('-------updateWardCollectionRates', data);
      return data;
    } catch (error) {
      console.error('Error in updateWardCollectionRates:', error);
      throw error;
    }
  } else {
    throw new Error('Update operations are not supported in static JSON mode');
  }
}
