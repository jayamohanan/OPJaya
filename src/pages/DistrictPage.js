import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
import RankingSection from '../components/RankingSection';
import { LanguageContext } from '../components/LanguageContext';
import MapSection from '../components/MapSection';
import ChoroplethMapRect from '../components/ChoroplethMapRect';
import React from 'react';

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
  const [assemblies, setAssemblies] = useState([]); // [{ id, name, category }]
  const [district, setDistrict] = useState(null);
  const [mapTab, setMapTab] = useState('choropleth');
  const [selectedPalette, setSelectedPalette] = useState('palette4');
  const [pendingPalette, setPendingPalette] = useState('palette4');
  const [geojsonError, setGeojsonError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch district by ID (get both _ml and _en)
      const { data: districtData, error: districtError } = await supabase
        .from(TABLES.DISTRICT)
        .select([
          FIELDS.DISTRICT.ID,
          FIELDS.DISTRICT.NAME_EN,
          FIELDS.DISTRICT.NAME_ML
        ].join(', '))
        .eq(FIELDS.DISTRICT.ID, districtId)
        .single();
      if (districtError || !districtData) {
        setAssemblies([]);
        setDistrict(null);
        return;
      }
      setDistrict(districtData);

      // Fetch all assemblies in this district with their category (get both _ml and _en)
      const { data: asms, error: asmError } = await supabase
        .from(TABLES.ASSEMBLY)
        .select([
          FIELDS.ASSEMBLY.ID,
          FIELDS.ASSEMBLY.NAME_EN,
          FIELDS.ASSEMBLY.NAME_ML,
          `${TABLES.ASSEMBLY_CATEGORY}(${FIELDS.ASSEMBLY_CATEGORY.CATEGORY})`
        ].join(', '))
        .eq(FIELDS.ASSEMBLY.DISTRICT_ID, districtData[FIELDS.DISTRICT.ID]);
      if (asmError) {
        setAssemblies([]);
      } else {
        setAssemblies(
          (asms || []).map(a => ({
            id: a[FIELDS.ASSEMBLY.ID],
            name: lang === 'ml' ? (a[FIELDS.ASSEMBLY.NAME_ML] || a[FIELDS.ASSEMBLY.NAME_EN]) : (a[FIELDS.ASSEMBLY.NAME_EN] || a[FIELDS.ASSEMBLY.NAME_ML]),
            category: a.assembly_category?.[FIELDS.ASSEMBLY_CATEGORY.CATEGORY] || 'Normal'
          }))
        );
      }
    }
    fetchData();
  }, [districtId, lang]);

  // Get English name for geojson path
  const districtNameEn = district?.district_name_en || '';
  // Replace spaces with hyphens for R2 asset naming
  const geojsonFileName = districtNameEn ? `${districtNameEn.toLowerCase().replace(/\s+/g, '-')}.geojson` : '';
  const geojsonUrl = districtNameEn
    ? `https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/geojson/districts/with-assemblies/${geojsonFileName}`
    : null;

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  // Prepare items for RankingSection
  const rankingItems = assemblies; // assemblies already has id, name, category

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div style={{ padding: 20, paddingTop: 32 }}>
      <h1 style={{ marginBottom: 24 }}>
        {lang === 'ml'
          ? ((district?.district_name_ml || district?.district_name_en) + ' District')
          : ((district?.district_name_en || district?.district_name_ml) + ' District')}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, maxWidth: 1200, margin: '0 auto 32px auto', width: '100%' }}>
        {/* Map Section (remaining width) */}
        <div style={{ flex: 1, minWidth: 0, height: 'auto', alignSelf: 'flex-start', display: 'flex', justifyContent: 'center' }}>
          {geojsonError ? (
            <div style={{ width: 600, minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff3f3', color: '#b71c1c', borderRadius: 12, fontWeight: 500, fontSize: 18, border: '1px solid #ffcdd2' }}>
              Map file not found: {geojsonError}
            </div>
          ) : geojsonUrl && (
            <div style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 0, padding: 0, overflow: 'hidden', width: 600, background: '#f8fafd' }}>
              <div style={{ width: 600, display: 'flex', justifyContent: 'center', borderBottom: '1px solid #eee', background: '#f7f7f7' }}>
                <div style={{ display: 'flex', width: 600, maxWidth: '100%' }}>
                  <button onClick={() => setMapTab('choropleth')} style={{ flex: 1, padding: 10, border: 'none', background: mapTab === 'choropleth' ? '#fff' : 'transparent', fontWeight: mapTab === 'choropleth' ? 700 : 400, borderBottom: mapTab === 'choropleth' ? '2px solid #1976d2' : 'none', cursor: 'pointer', fontSize: 16 }}>Rank</button>
                  <button onClick={() => setMapTab('base')} style={{ flex: 1, padding: 10, border: 'none', background: mapTab === 'base' ? '#fff' : 'transparent', fontWeight: mapTab === 'base' ? 700 : 400, borderBottom: mapTab === 'base' ? '2px solid #1976d2' : 'none', cursor: 'pointer', fontSize: 16 }}>Map</button>
                </div>
              </div>
              <div style={{ padding: 0, minHeight: 420 }}>
                {mapTab === 'choropleth' && (
                  <ChoroplethMapRect
                    geojsonUrl={geojsonUrl}
                    featureType="assembly"
                    featureCategories={assemblies.map(a => ({
                      ...a,
                      name_en: (a.assembly_name_en || '').toLowerCase(),
                      name_ml: (a.assembly_name_ml || '').toLowerCase(),
                      category: a.category || 'Normal'
                    }))}
                    showBaseMap={true}
                    fillOpacity={0.4}
                    tileLayerUrl={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    hoverHighlightStyle={{ weight: 4, color: '#1976d2', fillOpacity: 0.5 }}
                    palette="palette5"
                    lang={lang}
                  />
                )}
                {mapTab === 'base' && (
                  <MapSection
                    geojsonUrl={geojsonUrl}
                    title={lang === 'ml' ? (district?.district_name_ml || district?.district_name_en) : (district?.district_name_en || district?.district_name_ml)}
                    zoomControl={false}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        {/* Ranking Section (fixed width) */}
        <div style={{ width: 320, minWidth: 0, marginLeft: 0, overflow: 'auto', maxHeight: 600 }}>
          <RankingSection
            title={
              (lang === 'ml'
                ? (district?.district_name_ml || district?.district_name_en)
                : (district?.district_name_en || district?.district_name_ml)) + ' Ranking'
            }
            items={rankingItems}
            categories={rankingCategories}
            itemType="assembly"
            minWidth={240}
            maxWidth={320}
          />
        </div>
      </div>
    </div>
  );
}

export default DistrictPage;