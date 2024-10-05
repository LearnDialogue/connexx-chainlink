module.exports.fetchLocation = async (name, coordinates) => {
    var url = "";

    // Fetch based on location name
    if (name) {
        const query = encodeURIComponent(name);
        const countryCodes = 'us';
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=${countryCodes}`;

    // Fetch based on location coordinates
    } else if (coordinates) {
        const lat = coordinates[0];
        const lon = coordinates[1];
        url = `https://nominatim.openstreetmap.org/reverse?&format=json&lat=${lat}&lon=${lon}`;
    } else {
        return null;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://cycling-matchmaker.com',
                'User-Agent': 'CyclingMatchmaker/1.0'
            }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
            return data[0];
        } else { return data; }

    } catch (error) {
        console.error('Error fetching location:', error);
    }
}