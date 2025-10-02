import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { getDistrictData, getAssembliesForDistrict } from '../services/clientDataService';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LanguageContext } from '../components/LanguageContext';
import RegionInfoPage from '../components/RegionInfoPage';
import React from 'react';
import { LABELS } from '../constants/labels';

const paletteOptions = [
  { key: 'palette1', label: 'Palette 1 – Fresh & Natural' },
  { key: 'palette2', label: 'Palette 2 – Modern & Polished' },
  { key: 'palette3', label: 'Palette 3 – Pastel & Elegant' },
  { key: 'palette4', label: 'Palette 4 – Green → Teal → Orange' },
  { key: 'palette5', label: 'Palette 5 – Green → Light Green → Orange-Red' },
  { key: 'palette6', label: 'Palette 6 – Green → Aqua → Coral' },
];

function DistrictPage() {
  const { districtName: districtId } = useParams();
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [assemblies, setAssemblies] = useState([]);
  const [district, setDistrict] = useState(null);
  const [mapTab, setMapTab] = useState('choropleth');
  const [geojsonError, setGeojsonError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const districtData = await getDistrictData(districtId);
        if (!districtData) {
          setAssemblies([]);
          setDistrict(null);
          return;
        }
        setDistrict(districtData);

        const asms = await getAssembliesForDistrict(districtId);
        setAssemblies(
          (asms || []).map(a => ({
            id: a[FIELDS.ASSEMBLY.ID],
            name: lang === 'ml' ? (a[FIELDS.ASSEMBLY.NAME_ML] || a[FIELDS.ASSEMBLY.NAME_EN]) : (a[FIELDS.ASSEMBLY.NAME_EN] || a[FIELDS.ASSEMBLY.NAME_ML]),
            category: a.assembly_category?.[FIELDS.ASSEMBLY_CATEGORY.CATEGORY] || 'Normal',
            assembly_name_en: a[FIELDS.ASSEMBLY.NAME_EN],
            assembly_name_ml: a[FIELDS.ASSEMBLY.NAME_ML]
          }))
        );
      } catch (error) {
        console.error('Error fetching district data:', error);
        setAssemblies([]);
        setDistrict(null);
      }
    }
    fetchData();
  }, [districtId, lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const districtNameEn = district?.[FIELDS.DISTRICT.NAME_EN] || '';
  const geojsonFileName = districtNameEn ? `${districtNameEn.toLowerCase().replace(/\s+/g, '-')}.geojson` : '';
  const geojsonUrl = districtNameEn
    ? `https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/geojson/districts/with-assemblies/${geojsonFileName}`
    : null;

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  const rankingItems = assemblies;

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
        ? ((district?.[FIELDS.DISTRICT.NAME_ML] || district?.[FIELDS.DISTRICT.NAME_EN]) + ' ' + LABELS.district[lang])
        : ((district?.[FIELDS.DISTRICT.NAME_EN] || district?.[FIELDS.DISTRICT.NAME_ML]) + ' ' + LABELS.district[lang])}
      geojsonUrl={geojsonUrl}
      rankingItems={rankingItems.map(a => ({
        ...a,
        name_en: (a.assembly_name_en || '').toLowerCase(),
        name_ml: (a.assembly_name_ml || '').toLowerCase(),
        category: a.category || 'Normal'
      }))}
      rankingCategories={rankingCategories}
      itemType="assembly"
      mapTab={mapTab}
      setMapTab={setMapTab}
      geojsonError={geojsonError}
      parentAssembly={undefined}
      parentDistrict={district ? { id: district[FIELDS.DISTRICT.ID], name: district[lang === 'ml' ? FIELDS.DISTRICT.NAME_ML : FIELDS.DISTRICT.NAME_EN] } : undefined}
      lang={lang}
    />
  );
}

export default DistrictPage;