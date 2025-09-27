import React, { useEffect, useState, useContext } from 'react';
import RegionInfoPage from '../components/RegionInfoPage';
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LanguageContext } from '../components/LanguageContext';

function StatePage() {
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [districts, setDistricts] = useState([]);
  const [mapTab, setMapTab] = useState('choropleth');
  const [geojsonError, setGeojsonError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch all districts
      const { data: districtData, error: districtError } = await supabase
        .from(TABLES.DISTRICT)
        .select([
          FIELDS.DISTRICT.ID,
          FIELDS.DISTRICT.NAME_EN,
          FIELDS.DISTRICT.NAME_ML
        ].join(', '));
      if (districtError || !districtData) {
        setDistricts([]);
        return;
      }
      // Fetch district categories
      const { data: catData, error: catError } = await supabase
        .from('district_category')
        .select('district_id, category');
      // Map categories to districts
      const categoryMap = {};
      (catData || []).forEach(cat => {
        categoryMap[cat.district_id] = cat.category;
      });
      const districtsWithCategory = (districtData || []).map(d => ({
        id: d[FIELDS.DISTRICT.ID],
        name: lang === 'ml' ? (d[FIELDS.DISTRICT.NAME_ML] || d[FIELDS.DISTRICT.NAME_EN]) : (d[FIELDS.DISTRICT.NAME_EN] || d[FIELDS.DISTRICT.NAME_ML]),
        name_en: (d[FIELDS.DISTRICT.NAME_EN] || '').toLowerCase().trim(),
        category: categoryMap[d[FIELDS.DISTRICT.ID]] || 'Normal'
      }));
      setDistricts(districtsWithCategory);
    }
    fetchData();
  }, [lang]);

  const rankingItems = districts;
  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  const geojsonUrl = 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/geojson/states/with-districts/kerala.geojson';

  useEffect(() => {
    setGeojsonError(null);
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(() => setGeojsonError(null))
      .catch(() => setGeojsonError('kerala.geojson'));
  }, [geojsonUrl]);

  return (
    <RegionInfoPage
      title={lang === 'ml' ? 'കേരളം' : 'Kerala State'}
      geojsonUrl={geojsonUrl}
      rankingItems={rankingItems}
      rankingCategories={rankingCategories}
      itemType="district"
      mapTab={mapTab}
      setMapTab={setMapTab}
      geojsonError={geojsonError}
      lang={lang}
    />
  );
}

export default StatePage;
