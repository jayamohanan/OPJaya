import { FIELDS } from '../constants/dbSchema';

// Map Supabase response to internal structure
export const mapLocalBodyData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.LOCAL_BODY.ID]: supabaseData[FIELDS.LOCAL_BODY.ID],
    [FIELDS.LOCAL_BODY.NAME_EN]: supabaseData[FIELDS.LOCAL_BODY.NAME_EN],
    [FIELDS.LOCAL_BODY.NAME_ML]: supabaseData[FIELDS.LOCAL_BODY.NAME_ML],
    [FIELDS.LOCAL_BODY.ASSEMBLY_ID]: supabaseData[FIELDS.LOCAL_BODY.ASSEMBLY_ID],
    [FIELDS.LOCAL_BODY.TYPE_ID]: supabaseData[FIELDS.LOCAL_BODY.TYPE_ID],
    [FIELDS.LOCAL_BODY.BLOCK_NAME_EN]: supabaseData[FIELDS.LOCAL_BODY.BLOCK_NAME_EN],
    [FIELDS.LOCAL_BODY.DIST_PANCHAYAT_NAME_EN]: supabaseData[FIELDS.LOCAL_BODY.DIST_PANCHAYAT_NAME_EN],
    // Map nested local_body_type using TABLES name as key
    [FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN]: supabaseData.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN],
    [FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML]: supabaseData.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML],
    [FIELDS.LOCAL_BODY_TYPE.TYPE_ID]: supabaseData.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_ID],
    // Map nested local_body_category using FIELDS reference
    [FIELDS.LOCAL_BODY_CATEGORY.CATEGORY]: supabaseData.local_body_category?.[FIELDS.LOCAL_BODY_CATEGORY.CATEGORY]
  };
};

export const mapAssemblyData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.ASSEMBLY.ID]: supabaseData[FIELDS.ASSEMBLY.ID],
    [FIELDS.ASSEMBLY.NAME_EN]: supabaseData[FIELDS.ASSEMBLY.NAME_EN],
    [FIELDS.ASSEMBLY.NAME_ML]: supabaseData[FIELDS.ASSEMBLY.NAME_ML],
    [FIELDS.ASSEMBLY.DISTRICT_ID]: supabaseData[FIELDS.ASSEMBLY.DISTRICT_ID],
    // Map nested assembly_category
    [FIELDS.ASSEMBLY_CATEGORY.CATEGORY]: supabaseData.assembly_category?.[FIELDS.ASSEMBLY_CATEGORY.CATEGORY]
  };
};

export const mapDistrictData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.DISTRICT.ID]: supabaseData[FIELDS.DISTRICT.ID],
    [FIELDS.DISTRICT.NAME_EN]: supabaseData[FIELDS.DISTRICT.NAME_EN],
    [FIELDS.DISTRICT.NAME_ML]: supabaseData[FIELDS.DISTRICT.NAME_ML],
    // Map nested district_category
    [FIELDS.DISTRICT_CATEGORY.CATEGORY]: supabaseData.district_category?.[FIELDS.DISTRICT_CATEGORY.CATEGORY]
  };
};

export const mapWardData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.WARD.ID]: supabaseData[FIELDS.WARD.ID],
    [FIELDS.WARD.WARD_NO]: supabaseData[FIELDS.WARD.WARD_NO],
    [FIELDS.WARD.WARD_NAME_EN]: supabaseData[FIELDS.WARD.WARD_NAME_EN],
    [FIELDS.WARD.WARD_NAME_ML]: supabaseData[FIELDS.WARD.WARD_NAME_ML],
    [FIELDS.WARD.LOCAL_BODY_ID]: supabaseData[FIELDS.WARD.LOCAL_BODY_ID],
    [FIELDS.WARD.ELECTED_MEMBER_EN]: supabaseData[FIELDS.WARD.ELECTED_MEMBER_EN],
    [FIELDS.WARD.ELECTED_MEMBER_ML]: supabaseData[FIELDS.WARD.ELECTED_MEMBER_ML],
    [FIELDS.WARD.ROLE]: supabaseData[FIELDS.WARD.ROLE],
    [FIELDS.WARD.PARTY]: supabaseData[FIELDS.WARD.PARTY],
    [FIELDS.WARD.RESERVATION]: supabaseData[FIELDS.WARD.RESERVATION],
    [FIELDS.WARD.LAST_PATH_SEGMENT]: supabaseData[FIELDS.WARD.LAST_PATH_SEGMENT]
  };
};

export const mapIssueData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.ISSUES.ID]: supabaseData[FIELDS.ISSUES.ID],
    [FIELDS.ISSUES.DESCRIPTION]: supabaseData[FIELDS.ISSUES.DESCRIPTION],
    [FIELDS.ISSUES.TYPE]: supabaseData[FIELDS.ISSUES.TYPE],
    [FIELDS.ISSUES.LOCAL_BODY_ID]: supabaseData[FIELDS.ISSUES.LOCAL_BODY_ID],
    [FIELDS.ISSUES.CREATED_AT]: supabaseData[FIELDS.ISSUES.CREATED_AT],
    [FIELDS.ISSUES.RESOLVED]: supabaseData[FIELDS.ISSUES.RESOLVED],
    [FIELDS.ISSUES.LOCATION_URL]: supabaseData[FIELDS.ISSUES.LOCATION_URL],
    [FIELDS.ISSUES.IMAGE_URL]: supabaseData[FIELDS.ISSUES.IMAGE_URL],
    [FIELDS.ISSUES.TOWN_ID]: supabaseData[FIELDS.ISSUES.TOWN_ID]
  };
};

export const mapTownData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.TOWN.ID]: supabaseData[FIELDS.TOWN.ID],
    [FIELDS.TOWN.TOWN_NAME_EN]: supabaseData[FIELDS.TOWN.TOWN_NAME_EN],
    [FIELDS.TOWN.TOWN_NAME_ML]: supabaseData[FIELDS.TOWN.TOWN_NAME_ML],
    [FIELDS.TOWN.LOCAL_BODY_ID]: supabaseData[FIELDS.TOWN.LOCAL_BODY_ID],
    [FIELDS.TOWN.CREATED_AT]: supabaseData[FIELDS.TOWN.CREATED_AT]
  };
};

export const mapWardCollectionData = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    [FIELDS.WARD_COLLECTION.WARD_ID]: supabaseData[FIELDS.WARD_COLLECTION.WARD_ID],
    [FIELDS.WARD_COLLECTION.RATE]: supabaseData[FIELDS.WARD_COLLECTION.RATE],
    [FIELDS.WARD_COLLECTION.YEAR_MONTH]: supabaseData[FIELDS.WARD_COLLECTION.YEAR_MONTH],
    [FIELDS.WARD_COLLECTION.COLLECTION_ID]: supabaseData[FIELDS.WARD_COLLECTION.COLLECTION_ID]
  };
};
