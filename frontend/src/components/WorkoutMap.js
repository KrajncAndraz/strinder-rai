import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapAutoCenter({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const last = positions[positions.length - 1];
            map.setView(last, 17); // Zoom 18x na zadnjo točko
        }
    }, [positions, map]);

    return null;
}

function WorkoutMap({ trackers }) {
    // Pridobi vse koordinate (lat, long) iz trackerjev
    const positions = trackers.map((tracker) => [parseFloat(tracker.lat), parseFloat(tracker.long)]);

    return (
        <div style={{ height: '400px', width: '100%', marginLeft: '20px', marginRight: '20px' }}>
            <MapContainer center={positions[0] || [0, 0]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {positions.length > 1 && <Polyline positions={positions} color="blue" />}
                <MapAutoCenter positions={positions} />
            </MapContainer>
        </div>
    );
}

export default WorkoutMap;