import React, { useEffect, useState, useContext } from 'react';
import RegionInfoPage from '../components/RegionInfoPage';
import { getStateData } from '../services/clientDataService';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LanguageContext } from '../components/LanguageContext';

function StatePage() {
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [districts, setDistricts] = useState([]);
  const [mapTab, setMapTab] = useState('choropleth');
  const [geojsonError, setGeojsonError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const stateData = await getStateData();
        if (!stateData || !stateData.districts) {
          setDistricts([]);
          return;
        }
        const districtsWithCategory = (stateData.districts || []).map(d => ({
          id: d.district_id,
          name: lang === 'ml' ? (d.district_name_ml || d.district_name_en) : (d.district_name_en || d.district_name_ml),
          name_en: (d.district_name_en || '').toLowerCase().trim(),
          category: d.category || 'Normal'
        }));
        setDistricts(districtsWithCategory);
      } catch (error) {
        console.error('Error fetching state data:', error);
        setDistricts([]);
      }
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
