import React from 'react';
import RankingSection from '../components/RankingSection';
import MapSection from '../components/MapSection';
import ChoroplethMapRect from '../components/ChoroplethMapRect';

function RegionInfoPage({
	title,
	geojsonUrl,
	rankingItems,
	rankingCategories,
	itemType,
	mapTab,
	setMapTab,
	geojsonError,
	parentAssembly,
	parentDistrict,
	lang
}) {
	return (
		<div style={{ padding: 20, paddingTop: 32 }}>
			<h1 style={{ marginBottom: 24 }}>{title}</h1>
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
										featureType={itemType}
										featureCategories={rankingItems}
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
										title={title}
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
						title={title + ' Ranking'}
						items={rankingItems}
						categories={rankingCategories}
						itemType={itemType}
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

export default RegionInfoPage;
