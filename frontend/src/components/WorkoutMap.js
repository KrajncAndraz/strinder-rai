import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

function WorkoutMap({ trackers }) {
    // Pridobi vse koordinate (lat, long) iz trackerjev
    const positions = trackers.map((tracker) => [parseFloat(tracker.lat), parseFloat(tracker.long)]);

    return (
        <div style={{ height: '80vh', width: '70%', margin: '5%', marginLeft: '15%', marginRight: '15%' }}>
            <MapContainer center={positions[0] || [0, 0]} zoom={18} style={{ height: '100%', width: '100%' }}>
                {/* Dodaj osnovni sloj zemljevida */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Poveži točke z linijami */}
                {positions.length > 1 && <Polyline positions={positions} color="blue" />}
            </MapContainer>
        </div>
    );
}

export default WorkoutMap;