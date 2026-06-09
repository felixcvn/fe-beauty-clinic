import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';
import { pasienAPI } from '../../services/api';

// Dictionary koordinat untuk kecamatan di Jember dan sekitarnya
const KECAMATAN_COORDS = {
    "Sumbersari": { lat: -8.1691, lng: 113.7020 },
    "Kaliwates": { lat: -8.1793, lng: 113.6828 },
    "Patrang": { lat: -8.1565, lng: 113.7121 },
    "Puger": { lat: -8.3752, lng: 113.4756 },
    "Ambulu": { lat: -8.3444, lng: 113.6062 },
    "Wuluhan": { lat: -8.3619, lng: 113.5350 },
    "Balung": { lat: -8.2741, lng: 113.5413 },
    "Rambipuji": { lat: -8.2146, lng: 113.6062 },
    "Bangsalsari": { lat: -8.2045, lng: 113.5283 },
    "Kencong": { lat: -8.2703, lng: 113.2844 },
    "Jenggawah": { lat: -8.2764, lng: 113.6558 },
    "Ajung": { lat: -8.2198, lng: 113.6702 },
    "Mayang": { lat: -8.1882, lng: 113.7845 },
    "Arjasa": { lat: -8.1106, lng: 113.7432 },
    "Jelbuk": { lat: -8.0567, lng: 113.7543 },
    "Tempurejo": { lat: -8.3562, lng: 113.6821 },
    "Silo": { lat: -8.2321, lng: 113.8407 },
    "Mumbulsari": { lat: -8.2536, lng: 113.7185 },
    "Kalisat": { lat: -8.1325, lng: 113.8051 },
    "Ledokombo": { lat: -8.1354, lng: 113.8647 },
    "Sukowono": { lat: -8.0865, lng: 113.8315 },
    "Sumberjambe": { lat: -8.0642, lng: 113.8761 },
    "Tanggul": { lat: -8.1637, lng: 113.4475 },
    "Sumberbaru": { lat: -8.1073, lng: 113.3854 },
    "Semboro": { lat: -8.2041, lng: 113.4568 },
    "Umbulsari": { lat: -8.2618, lng: 113.4357 },
    "Jombang": { lat: -8.2721, lng: 113.3482 },
    "Gumukmas": { lat: -8.3415, lng: 113.3981 },
    "Sukorambi": { lat: -8.1387, lng: 113.6541 },
    "Panti": { lat: -8.0815, lng: 113.5852 },
};

const getColorBasedOnDensity = (total) => {
    if (total >= 400) return '#FF0000'; // Merah tua
    if (total >= 300) return '#FF4500'; // Merah orange
    if (total >= 200) return '#FF8C00'; // Orange tua
    if (total >= 100) return '#FFA500'; // Orange
    if (total >= 50) return '#FFD700'; // Kuning
    return '#ADFF2F'; // Hijau muda (GreenYellow)
};

const PatientDistributionMap = () => {
    const { user } = useAuth();
    const [mapData, setMapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDistribution = async () => {
            if (!user?.token) return;
            try {
                const res = await pasienAPI.getDistribusiWilayah(user.token);
                if (res.success && res.data) {
                    // Mapping data dari backend dengan koordinat
                    // Asumsi struktur data backend: [{ kecamatan: 'SUMBERSARI', total_pasien: 150 }, ...]
                    const mapped = res.data.map(item => {
                        const namaKecamatan = item.kecamatan || item.name || "";
                        
                        // Normalisasi string: hilangkan spasi dan jadikan uppercase agar cocok ('GUMUK MAS' -> 'GUMUKMAS')
                        const normalizedBackendName = namaKecamatan.toUpperCase().replace(/\s+/g, '');
                        
                        // Cari di dictionary yang key-nya juga sudah kita uppercase & buang spasi
                        const matchedKey = Object.keys(KECAMATAN_COORDS).find(
                            key => key.toUpperCase().replace(/\s+/g, '') === normalizedBackendName
                        );

                        const coords = matchedKey ? KECAMATAN_COORDS[matchedKey] : { lat: -8.1691, lng: 113.7020 };
                        
                        return {
                            kecamatan: matchedKey || namaKecamatan, // Tampilkan nama yang rapi jika ada
                            lat: coords.lat,
                            lng: coords.lng,
                            total: parseInt(item.total_pasien || 0)
                        };
                    });
                    
                    // Gabungkan (sum) total pasien jika ada kecamatan yang koordinatnya jatuh di titik yang persis sama
                    // (misalnya karena gagal mapping dan masuk ke default)
                    const aggregated = Object.values(mapped.reduce((acc, curr) => {
                        const key = `${curr.lat},${curr.lng}`;
                        if (!acc[key]) acc[key] = { ...curr };
                        else acc[key].total += curr.total;
                        return acc;
                    }, {}));

                    setMapData(aggregated);
                }
            } catch (error) {
                console.error("Gagal mengambil data persebaran pasien", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDistribution();
    }, [user]);

    if (isLoading) {
        return (
            <div className="w-full h-full min-h-[400px] rounded-[2rem] bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[400px] rounded-[2rem] overflow-hidden relative z-0">
            <MapContainer center={[-8.1691, 113.7020]} zoom={10} className="w-full h-full" scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {mapData.map((data, idx) => {
                    const densityColor = getColorBasedOnDensity(data.total);
                    const radiusSize = Math.max(15, Math.sqrt(data.total) * 1.5);
                    
                    return (
                        <CircleMarker
                            key={idx}
                            center={[data.lat, data.lng]}
                            radius={radiusSize}
                            pathOptions={{
                                color: densityColor, 
                                fillColor: densityColor,
                                fillOpacity: 0.5, 
                                weight: 2
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                                <div className="text-center font-sans">
                                    <h4 className="font-medium text-sm text-gray-800">{data.kecamatan}</h4>
                                    <p className="text-xs text-gray-600">Total Pasien: <strong className="text-red-500">{data.total}</strong></p>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
            
            {/* Legend untuk Heatmap */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-gray-100 shadow-lg pointer-events-none">
                <h4 className="text-[10px] font-semibold uppercase text-gray-500 mb-2">Kepadatan Pasien</h4>
                <div className="flex flex-col gap-1 text-[10px] font-medium text-gray-700">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF0000]"></span> &gt; 400 Pasien</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF8C00]"></span> 200 - 400 Pasien</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FFD700]"></span> 50 - 200 Pasien</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ADFF2F]"></span> &lt; 50 Pasien</div>
                </div>
            </div>
        </div>
    );
};

export default PatientDistributionMap;
