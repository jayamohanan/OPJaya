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

function AssemblyPage() {
  const { assemblyName: assemblyId } = useParams();
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [rankedLocalBodies, setRankedLocalBodies] = useState([]); // [{ id, name, category }]
  const [otherAssemblies, setOtherAssemblies] = useState([]); // [{ id, name }]
  const [district, setDistrict] = useState('');
  const [assembly, setAssembly] = useState(null);
  // Tab state for map
  const [mapTab, setMapTab] = useState('choropleth');
  const [selectedPalette, setSelectedPalette] = useState('palette4');
  const [pendingPalette, setPendingPalette] = useState('palette4');
  const [geojsonError, setGeojsonError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch assembly by ID (get both _ml and _en)
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
        setOtherAssemblies([]);
        setDistrict('');
        setAssembly(null);
        return;
      }
      setAssembly(assemblyData);

      // Fetch district name (get both _ml and _en)
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

      // Fetch all local bodies in this assembly with their category (get both _ml and _en)
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
        // Group by category: Perfect > Good > Normal
        const categories = { 'Perfect': [], 'Good': [], 'Normal': [] };
        (lbs || []).forEach(lb => {
          const cat = lb.local_body_category?.[FIELDS.LOCAL_BODY_CATEGORY.CATEGORY] || 'Normal';
          if (categories[cat]) categories[cat].push(lb);
          else categories['Normal'].push(lb);
        });
        setRankedLocalBodies([
          ...categories['Perfect'],
          ...categories['Good'],
          ...categories['Normal']
        ]);
      }

      // Fetch all other assemblies in the same district (get both _ml and _en)
      if (assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]) {
        const { data: allInDistrict, error: error2 } = await supabase
          .from(TABLES.ASSEMBLY)
          .select([
            FIELDS.ASSEMBLY.ID,
            FIELDS.ASSEMBLY.NAME_EN,
            FIELDS.ASSEMBLY.NAME_ML
          ].join(', '))
          .eq(FIELDS.ASSEMBLY.DISTRICT_ID, assemblyData[FIELDS.ASSEMBLY.DISTRICT_ID]);
        if (!error2 && allInDistrict) {
          setOtherAssemblies(
            allInDistrict
              .filter(a => a[FIELDS.ASSEMBLY.ID] !== assemblyId)
              .sort((a, b) => {
                const aName = lang === 'ml' ? (a[FIELDS.ASSEMBLY.NAME_ML] || a[FIELDS.ASSEMBLY.NAME_EN]) : (a[FIELDS.ASSEMBLY.NAME_EN] || a[FIELDS.ASSEMBLY.NAME_ML]);
                const bName = lang === 'ml' ? (b[FIELDS.ASSEMBLY.NAME_ML] || b[FIELDS.ASSEMBLY.NAME_EN]) : (b[FIELDS.ASSEMBLY.NAME_EN] || b[FIELDS.ASSEMBLY.NAME_ML]);
                return aName.localeCompare(bName);
              })
          );
        } else {
          setOtherAssemblies([]);
        }
      }
    }
    fetchData();
  }, [assemblyId, lang]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare items for RankingSection
  const rankingItems = rankedLocalBodies.map(lb => ({
    id: lb[FIELDS.LOCAL_BODY.ID],
    name:
      lang === 'ml'
        ? (lb[FIELDS.LOCAL_BODY.NAME_ML] || lb[FIELDS.LOCAL_BODY.NAME_EN])
        : (lb[FIELDS.LOCAL_BODY.NAME_EN] || lb[FIELDS.LOCAL_BODY.NAME_ML]),
    type: lb.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN] || lb.local_body_type?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML] || '',
    category: lb.local_body_category?.[FIELDS.LOCAL_BODY_CATEGORY.CATEGORY] || 'Normal'
  }));

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  // Pass parent assembly and district info for state
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

  // Get English name for geojson path
  const assemblyNameEn = assembly?.[FIELDS.ASSEMBLY.NAME_EN] || '';
  // Replace spaces with hyphens for R2 asset naming
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
    <div style={{ padding: 20, paddingTop: 32 }}>
      <h1 style={{ marginBottom: 24 }}>
        {lang === 'ml'
          ? ((assembly?.assembly_name_ml || assembly?.assembly_name_en) + ' Assembly')
          : ((assembly?.assembly_name_en || assembly?.assembly_name_ml) + ' Assembly')}
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
                    featureType="local_body"
                    featureCategories={rankedLocalBodies.map(lb => ({
                      ...lb,
                      name_en: (lb.local_body_name_en || '').toLowerCase(),
                      name_ml: (lb.local_body_name_ml || '').toLowerCase(),
                      category: lb.local_body_category?.category || 'Normal'
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
                    title={lang === 'ml' ? (assembly?.assembly_name_ml || assembly?.assembly_name_en) : (assembly?.assembly_name_en || assembly?.assembly_name_ml)}
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
            items={rankingItems}
            categories={rankingCategories}
            itemType="local_body"
            parentAssembly={parentAssembly}
            parentDistrict={parentDistrict}
            minWidth={240}
            maxWidth={320}
          />
        </div>
      </div>
    </div>
  );
}

export default AssemblyPage;