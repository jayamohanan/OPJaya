import React from 'react';
import RegionInfoPage from '../components/RegionInfoPage';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { getAssemblyData, getDistrictData, getLocalBodiesForAssembly } from '../services/clientDataService';
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
      try {
        const assemblyData = await getAssemblyData(assemblyId);
        if (!assemblyData) {
          setRankedLocalBodies([]);
          setDistrict('');
          setAssembly(null);
          return;
        }
        setAssembly(assemblyData);

        let districtName = '';
        if (assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]) {
          const districtData = await getDistrictData(assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]);
          if (districtData) {
            districtName =
              lang === 'ml'
                ? (districtData[FIELDS.DISTRICT.NAME_ML] || districtData[FIELDS.DISTRICT.NAME_EN])
                : (districtData[FIELDS.DISTRICT.NAME_EN] || districtData[FIELDS.DISTRICT.NAME_ML]);
          }
        }
        setDistrict(districtName);

        const lbs = await getLocalBodiesForAssembly(assemblyId);
        const categories = { 'Perfect': [], 'Good': [], 'Normal': [] };
        (lbs || []).forEach(lb => {
          const cat = lb.local_body_category?.category || 'Normal';
          if(categories[cat]) {
            categories[cat].push(lb);
          } else {
            categories['Normal'].push(lb);
          }
        });
        setRankedLocalBodies([
          ...categories['Perfect'],
          ...categories['Good'],
          ...categories['Normal']
        ]);
      } catch (error) {
        console.error('Error fetching assembly data:', error);
        setRankedLocalBodies([]);
        setDistrict('');
        setAssembly(null);
      }
    }
    fetchData();
  }, [assemblyId, lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const rankingItems = rankedLocalBodies.map(lb => ({
    id: lb.id,
    name:
      lang === 'ml'
        ? (lb.name_ml || lb.name_en)
        : (lb.name_en || lb.name_ml),
    name_en: (lb.name_en || '').toLowerCase().trim(),
    type: lb.local_body_type?.type_name_en || lb.local_body_type?.type_name_ml || '',
    category: lb.local_body_category?.category || 'Normal'
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
  console.log('geojsonFileName ', geojsonFileName);
  const geojsonUrl = assemblyNameEn
    ? `${process.env.PUBLIC_URL}/geojson/assemblies/with-local-bodies/${geojsonFileName}`
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