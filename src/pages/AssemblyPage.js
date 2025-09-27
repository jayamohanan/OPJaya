import React from 'react';
import RegionInfoPage from '../components/RegionInfoPage';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LanguageContext } from '../components/LanguageContext';
import { LABELS } from '../constants/labels';


function AssemblyPage() {
  const { assemblyName: assemblyId } = useParams();
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [rankedLocalBodies, setRankedLocalBodies] = useState([]);
  const [district, setDistrict] = useState('');
  const [assembly, setAssembly] = useState(null);
  const [mapTab, setMapTab] = useState('choropleth');
  const [geojsonError, setGeojsonError] = useState(null);

  useEffect(() => {
    async function fetchData() {
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
      if (assemblyError || !assemblyData) {
        setRankedLocalBodies([]);
        setDistrict('');
        setAssembly(null);
        return;
      }
      setAssembly(assemblyData);

      let districtName = '';
      if (assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]) {
        const { data: districtData, error: districtError } = await supabase
          .from(TABLES.DISTRICT)
          .select([
            FIELDS.DISTRICT.NAME_EN,
            FIELDS.DISTRICT.NAME_ML
          ].join(', '))
          .eq(FIELDS.DISTRICT.ID, assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID])
          .single();
        if (!districtError && districtData) {
          districtName =
            lang === 'ml'
              ? (districtData[FIELDS.DISTRICT.NAME_ML] || districtData[FIELDS.DISTRICT.NAME_EN])
              : (districtData[FIELDS.DISTRICT.NAME_EN] || districtData[FIELDS.DISTRICT.NAME_ML]);
        }
      }
      setDistrict(districtName);

      const { data: lbs, error: lbError } = await supabase
        .from(TABLES.LOCAL_BODY)
        .select([
          FIELDS.LOCAL_BODY.ID,
          FIELDS.LOCAL_BODY.NAME_EN,
          FIELDS.LOCAL_BODY.NAME_ML,
          `${TABLES.LOCAL_BODY_CATEGORY}(${FIELDS.LOCAL_BODY_CATEGORY.CATEGORY})`
        ].join(', '))
        .eq(FIELDS.LOCAL_BODY.ASSEMBLY_ID, assemblyData[FIELDS.ASSEMBLY.ID]);
      if (lbError) {
        setRankedLocalBodies([]);
      } else {
        const categories = { 'Perfect': [], 'Good': [], 'Normal': [] };
        (lbs || []).forEach(lb => {
          const cat = lb.local_body_category?.[FIELDS.LOCAL_BODY_CATEGORY.CATEGORY] || 'Normal';
          if(categories[cat]) 
            {
              categories[cat].push(lb);
            }
          else {
            categories['Normal'].push(lb);
          }
        });
        setRankedLocalBodies([
          ...categories['Perfect'],
          ...categories['Good'],
          ...categories['Normal']
        ]);
      }

      if (assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]) {
        const { data: allInDistrict, error: error2 } = await supabase
          .from(TABLES.ASSEMBLY)
          .select([
            FIELDS.ASSEMBLY.ID,
            FIELDS.ASSEMBLY.NAME_EN,
            FIELDS.ASSEMBLY.NAME_ML
          ].join(', '))
          .eq(FIELDS.ASSEMBLY.DISTRICT_ID, assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]);
        
      }
    }
    fetchData();
  }, [assemblyId, lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const rankingItems = rankedLocalBodies.map(lb => ({
    id: lb[FIELDS.LOCAL_BODY.ID],
    name:
      lang === 'ml'
        ? (lb[FIELDS.LOCAL_BODY.NAME_ML] || lb[FIELDS.LOCAL_BODY.NAME_EN])
        : (lb[FIELDS.LOCAL_BODY.NAME_EN] || lb[FIELDS.LOCAL_BODY.NAME_ML]),
    name_en: (lb[FIELDS.LOCAL_BODY.NAME_EN] || '').toLowerCase().trim(),
    type: lb.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN] || lb.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML] || '',
    category: lb.local_body_category?.[FIELDS.LOCAL_BODY_CATEGORY.CATEGORY] || 'Normal'
  }));
  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  const parentAssembly = assembly
    ? {
        id: assembly[FIELDS.ASSEMBLY.ID],
        name: lang === 'ml' ? (assembly[FIELDS.ASSEMBLY.NAME_ML] || assembly[FIELDS.ASSEMBLY.NAME_EN]) : (assembly[FIELDS.ASSEMBLY.NAME_EN] || assembly[FIELDS.ASSEMBLY.NAME_ML])
      }
    : undefined;
  const parentDistrict = district
    ? {
        id: assembly?.[FIELDS.ASSEMBLY.DISTRICT_ID],
        name: district
      }
    : undefined;

  const assemblyNameEn = assembly?.[FIELDS.ASSEMBLY.NAME_EN] || '';
  const geojsonFileName = assemblyNameEn ? `${assemblyNameEn.toLowerCase().replace(/\s+/g, '-')}.geojson` : '';
  const geojsonUrl = assemblyNameEn
    ? `https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/geojson/assemblies/with-local-bodies/${geojsonFileName}`
    : null;

  useEffect(() => {
    setGeojsonError(null);
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(() => setGeojsonError(null))
      .catch(() => setGeojsonError(geojsonFileName));
  }, [geojsonUrl]);

  return (
    <RegionInfoPage
      title={lang === 'ml'
        ? ((assembly?.[FIELDS.ASSEMBLY.NAME_ML] || assembly?.[FIELDS.ASSEMBLY.NAME_EN]) + ' ' + LABELS.assembly[lang])
        : ((assembly?.[FIELDS.ASSEMBLY.NAME_EN] || assembly?.[FIELDS.ASSEMBLY.NAME_ML]) + ' ' + LABELS.assembly[lang])}
      geojsonUrl={geojsonUrl}
      rankingItems={rankingItems}
      rankingCategories={rankingCategories}
      itemType="local_body"
      mapTab={mapTab}
      setMapTab={setMapTab}
      geojsonError={geojsonError}
      parentAssembly={parentAssembly}
      parentDistrict={parentDistrict}
      lang={lang}
    />
  );
}

export default AssemblyPage;