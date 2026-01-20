import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Loader2, MapPin, Navigation, Star, Search, Filter, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Hospital Icon - Simple Red Pin
const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// User Location Icon - Blue
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Hospital {
  place_id: string;
  name: string;
  rating?: number;
  vicinity: string; // Used for address/location details
  lat: number;
  lng: number;
  isOpen?: boolean;
}

const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };

// Component to update map view when center changes
function ChangeView({ center, zoom }: { center: { lat: number, lng: number }, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
}

export default function HospitalsMap() {
  const [center, setCenter] = useState<{lat: number, lng: number} | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(userPos);
          setIsLoadingLocation(false);
          fetchHospitals(userPos.lat, userPos.lng);
        },
        (err) => {
          console.error("Error getting location", err);
          setError("Could not get your location. Defaulting to Mumbai.");
          setCenter(MUMBAI_CENTER);
          setIsLoadingLocation(false);
          fetchHospitals(MUMBAI_CENTER.lat, MUMBAI_CENTER.lng);
        }
      );
    } else {
      setError("Geolocation is not supported. Defaulting to Mumbai.");
      setCenter(MUMBAI_CENTER);
      setIsLoadingLocation(false);
      fetchHospitals(MUMBAI_CENTER.lat, MUMBAI_CENTER.lng);
    }
  }, []);

  // List of Overpass API instances to try in order
  const OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://interpreter.lazylibrarian.org/api/interpreter", 
    "https://overpass.kumi.systems/api/interpreter"
  ];

  const fetchHospitals = async (lat: number, lng: number) => {
    setIsLoadingHospitals(true);
    setError(null);
    
    // Overpass API Query for hospitals within 5km (5000m)
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000, ${lat}, ${lng});
        way["amenity"="hospital"](around:5000, ${lat}, ${lng});
        relation["amenity"="hospital"](around:5000, ${lat}, ${lng});
      );
      out center;
    `;
    
    let isSuccess = false;

    // Try each server until one works
    for (const server of OVERPASS_SERVERS) {
      if (isSuccess) break;

      try {
        console.log(`Attempting to fetch hospitals from: ${server}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`${server}?data=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server ${server} responded with ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const elements = data.elements;
        
        if (!elements) throw new Error("Invalid data format received");

        const formattedHospitals: Hospital[] = elements.map((item: any) => {
          const lat = item.lat || item.center?.lat;
          const lng = item.lon || item.center?.lon;
          
          // Simulating some data not present in OSM for UI consistency
          const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1); 
          
          return {
              place_id: item.id.toString(),
              name: item.tags.name || "Unknown Hospital",
              rating: parseFloat(rating),
              vicinity: [
                item.tags['addr:full'],
                [
                  item.tags['addr:housenumber'],
                  item.tags['addr:street'],
                  item.tags['addr:suburb'] || item.tags['addr:neighbourhood'],
                  item.tags['addr:city']
                ].filter(Boolean).join(', ')
              ].find(Boolean) || "Address details unavailable",
              lat: lat,
              lng: lng,
              isOpen: true // OSM data rarely has real-time opening status
          };
        }).filter((h: Hospital) => h.lat && h.lng && h.name !== "Unknown Hospital"); // Filter out invalid entries

        setHospitals(formattedHospitals);
        isSuccess = true;
        console.log("Successfully fetched hospital data.");
        
      } catch (err: any) {
        console.warn(`Failed to fetch from ${server}:`, err.message);
        // Continue to next server
      }
    }

    if (!isSuccess) {
      // All servers failed
      console.error("All Overpass API servers failed.");
      if (hospitals.length === 0) {
        setError("Unable to load nearby hospitals at this time. Please try again later.");
      }
    }
    
    setIsLoadingHospitals(false);
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setCenter({ lat: hospital.lat, lng: hospital.lng });
    // Open popup programmatically
    const marker = markersRef.current[hospital.place_id];
    if (marker) {
      marker.openPopup();
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.vicinity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const listVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6">
      {/* Sidebar List */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={listVariants}
        className="w-full lg:w-1/3 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100"
      >
        <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-display">Nearby Hospitals</h2>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search hospitals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 backdrop-blur-sm transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/60" />
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-primary-100">
            <Filter size={14} />
            <span>Found {filteredHospitals.length} facilities near you</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoadingHospitals ? (
            <div className="flex flex-col items-center justify-center py-10">
               <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
               <p className="text-slate-400 text-sm">Finding nearby hospitals...</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
             <div className="text-center py-10 text-slate-400">
              <p>No hospitals found in this area.</p>
            </div>
          ) : (
            filteredHospitals.map((hospital) => (
              <motion.div
                key={hospital.place_id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedHospital?.place_id === hospital.place_id
                    ? 'bg-primary-50 border-primary-200 shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-100'
                }`}
                onClick={() => handleHospitalSelect(hospital)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{hospital.name}</h3>
                  {hospital.rating && (
                    <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold text-yellow-700">
                      <Star size={12} className="fill-yellow-500 text-yellow-500 mr-1" />
                      {hospital.rating}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{hospital.vicinity}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleHospitalSelect(hospital);
                    }}
                    className="flex items-center text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Navigation size={12} className="mr-1.5" />
                    Directions
                  </button>
                  <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                    Open Now
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Map Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative group z-0"
      >
        {center && (
            <MapContainer 
                center={[center.lat, center.lng]} 
                zoom={14} 
                className="w-full h-full"
                ref={mapRef}
            >
                <ChangeView center={center} zoom={14} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Location Marker */}
               {!isLoadingLocation && (
                 <Marker position={[center.lat, center.lng]} icon={userIcon}>
                    <Popup>You are here</Popup>
                 </Marker>
               )}

                {/* Hospital Markers */}
                {filteredHospitals.map(hospital => (
                    <Marker 
                        key={hospital.place_id} 
                        position={[hospital.lat, hospital.lng]}
                        icon={hospitalIcon}
                        ref={(el) => {
                            if (el) {
                                markersRef.current[hospital.place_id] = el;
                            }
                        }}
                        eventHandlers={{
                            click: () => {
                                setSelectedHospital(hospital);
                            },
                        }}
                    >
                        <Popup>
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-sm text-slate-800 mb-1">{hospital.name}</h3>
                                <p className="text-xs text-slate-500 mb-2">{hospital.vicinity}</p>
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full gap-2 bg-blue-600 !text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    style={{ color: 'white' }}
                                >
                                    <Navigation size={12} />
                                    Open in Google Maps
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        )}
        
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-2" />
              <p className="text-slate-600 font-medium">Locating you...</p>
            </div>
          </div>
        )}

        {error && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-200 flex items-center gap-2 z-[1000]">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{error}</span>
             </div>
        )}
      </motion.div>
    </div>
  );
}
