import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
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

  useEffect(() => {
    async function fetchData() {
      // Fetch assembly by ID (get both _ml and _en)
      const { data: assemblyData, error: assemblyError } = await supabase
        .from('assembly')
        .select('assembly_id, assembly_name_en, assembly_name_ml, district_id')
        .eq('assembly_id', assemblyId)
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
      if (assemblyData.district_id) {
        const { data: districtData, error: districtError } = await supabase
          .from('district')
          .select('district_name_en, district_name_ml')
          .eq('district_id', assemblyData.district_id)
          .single();
        if (!districtError && districtData) {
          districtName =
            lang === 'ml'
              ? (districtData.district_name_ml || districtData.district_name_en)
              : (districtData.district_name_en || districtData.district_name_ml);
        }
      }
      setDistrict(districtName);

      // Fetch all local bodies in this assembly with their category (get both _ml and _en)
      const { data: lbs, error: lbError } = await supabase
        .from('local_body')
        .select('local_body_id, local_body_name_en, local_body_name_ml, local_body_category(category)')
        .eq('assembly_id', assemblyData.assembly_id);
      if (lbError) {
        setRankedLocalBodies([]);
      } else {
        // Group by category: Perfect > Good > Normal
        const categories = { 'Perfect': [], 'Good': [], 'Normal': [] };
        (lbs || []).forEach(lb => {
          const cat = lb.local_body_category?.category || 'Normal';
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
      if (assemblyData.district_id) {
        const { data: allInDistrict, error: error2 } = await supabase
          .from('assembly')
          .select('assembly_id, assembly_name_en, assembly_name_ml')
          .eq('district_id', assemblyData.district_id);
        if (!error2 && allInDistrict) {
          setOtherAssemblies(
            allInDistrict
              .filter(a => a.assembly_id !== assemblyId)
              .sort((a, b) => {
                const aName = lang === 'ml' ? (a.assembly_name_ml || a.assembly_name_en) : (a.assembly_name_en || a.assembly_name_ml);
                const bName = lang === 'ml' ? (b.assembly_name_ml || b.assembly_name_en) : (b.assembly_name_en || b.assembly_name_ml);
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
    id: lb.local_body_id,
    name:
      lang === 'ml'
        ? (lb.local_body_name_ml || lb.local_body_name_en)
        : (lb.local_body_name_en || lb.local_body_name_ml),
    type: lb.local_body_type?.type_name_en || lb.local_body_type?.type_name_ml || '',
    category: lb.local_body_category?.category || 'Normal'
  }));

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  // Pass parent assembly and district info for state
  const parentAssembly = assembly
    ? {
        id: assembly.assembly_id,
        name: lang === 'ml' ? (assembly.assembly_name_ml || assembly.assembly_name_en) : (assembly.assembly_name_en || assembly.assembly_name_ml)
      }
    : undefined;
  const parentDistrict = district
    ? {
        id: assembly?.district_id,
        name: district
      }
    : undefined;

  // Get English name for geojson path
  const assemblyNameEn = assembly?.assembly_name_en || '';
  const geojsonUrl = assemblyNameEn
    ? `https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/geojson/assemblies/with-local-bodies/${encodeURIComponent(assemblyNameEn.toLowerCase())}.geojson`
    : null;

  return (
    <div style={{ padding: '24px 16px' }}>
      <h1 style={{ marginBottom: 24 }}>
        Assembly: {lang === 'ml' ? (assembly?.assembly_name_ml || assembly?.assembly_name_en) : (assembly?.assembly_name_en || assembly?.assembly_name_ml)}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, maxWidth: 1200, margin: '0 auto 32px auto', width: '100%' }}>
        {/* Map Section (remaining width) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {geojsonUrl && (
            <div style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#f7f7f7', width: 400, margin: '0 auto' }}>
                <button onClick={() => setMapTab('choropleth')} style={{ flex: 1, padding: 16, border: 'none', background: mapTab === 'choropleth' ? '#fff' : 'transparent', fontWeight: mapTab === 'choropleth' ? 700 : 400, borderBottom: mapTab === 'choropleth' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}>Rank</button>
                <button onClick={() => setMapTab('base')} style={{ flex: 1, padding: 16, border: 'none', background: mapTab === 'base' ? '#fff' : 'transparent', fontWeight: mapTab === 'base' ? 700 : 400, borderBottom: mapTab === 'base' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}>Map</button>
              </div>
              <div style={{ padding: 0, minHeight: 420 }}>
                {mapTab === 'choropleth' && (
                  <ChoroplethMapRect
                    geojsonUrl={geojsonUrl}
                    featureType="local_body"
                    featureCategories={rankedLocalBodies.map(lb => ({
                      ...lb,
                      name: (lang === 'ml' ? (lb.local_body_name_ml || lb.local_body_name_en) : (lb.local_body_name_en || lb.local_body_name_ml) || '').toLowerCase(),
                      category: lb.local_body_category?.category || 'Normal'
                    }))}
                    showBaseMap={true}
                    fillOpacity={0.4}
                    tileLayerUrl={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    hoverHighlightStyle={{ weight: 4, color: '#1976d2', fillOpacity: 0.5 }}
                    palette="palette5"
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
            title={
              (lang === 'ml'
                ? (assembly?.assembly_name_ml || assembly?.assembly_name_en)
                : (assembly?.assembly_name_en || assembly?.assembly_name_ml)) + ' Ranking'
            }
            items={rankingItems}
            categories={rankingCategories}
            itemType="local_body"
            parentAssembly={parentAssembly}
            parentDistrict={parentDistrict}
            minWidth={240}
            maxWidth={320}
          />
          <div style={{ marginTop: 16 }}>
            <strong>
              Other Assemblies in {district || 'this district'}:
            </strong>
            <br />
            {otherAssemblies.length > 0
              ? otherAssemblies
                  .map(a =>
                    lang === 'ml'
                      ? (a.assembly_name_ml || a.assembly_name_en)
                      : (a.assembly_name_en || a.assembly_name_ml)
                  )
                  .join(', ')
              : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssemblyPage;