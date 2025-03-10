import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Component that creates grid cells based on the data
 */
function GridLayer({ data, tempMinRange, tempMaxRange, solarMinRange, solarMaxRange }) {
  // Only show data that falls within the selected ranges
  const filteredData = data.filter(point => {
    return (
      point.temp >= tempMinRange && 
      point.temp <= tempMaxRange && 
      point.solar >= solarMinRange && 
      point.solar <= solarMaxRange
    );
  });

  console.log(`Rendering ${filteredData.length} cells out of ${data.length} total data points`);

  // Create grid cell for each data point
  return (
    <>
      {filteredData.map((point, index) => {
        // Calculate cell bounds (each grid cell is 1° x 1°)
        const bounds = [
          [point.lat - 0.5, point.lon - 0.5], // Southwest corner
          [point.lat + 0.5, point.lon + 0.5]  // Northeast corner
        ];

        // Calculate color based on temperature
        // Red for hot, blue for cold
        const normalizedTemp = (point.temp + 20) / 140; // -20 to 120 -> 0 to 1
        const r = Math.round(255 * Math.min(1, normalizedTemp * 2)); // More red as it gets hotter
        const b = Math.round(255 * Math.min(1, (1 - normalizedTemp) * 2)); // More blue as it gets colder
        const g = Math.round(255 * Math.min(1, 1 - Math.abs(normalizedTemp - 0.5) * 2)); // Green in the middle

        // Calculate opacity based on solar value
        const opacity = 0.2 + ((point.solar / 100) * 0.5); // 0.2 to 0.7 opacity

        return (
          <Rectangle 
            key={`cell-${index}`}
            bounds={bounds}
            pathOptions={{
              color: 'transparent',
              fillColor: `rgb(${r}, ${g}, ${b})`,
              fillOpacity: opacity,
              weight: 0.5
            }}
          >
            <Tooltip>
              Temp: {point.temp.toFixed(1)}°F<br />
              Solar: {point.solar.toFixed(1)} ({Math.round(point.solar * 5)} W/m²)
            </Tooltip>
          </Rectangle>
        );
      })}
    </>
  );
}

/**
 * Dynamic component to update when map moves/zooms
 */
function MapUpdater({ data, tempMinRange, tempMaxRange, solarMinRange, solarMaxRange }) {
  const map = useMap();
  
  // Ensure map covers global extent
  useEffect(() => {
    console.log("Map view initialized");
    map.fitWorld();
  }, [map]);

  return (
    <GridLayer 
      data={data} 
      tempMinRange={tempMinRange} 
      tempMaxRange={tempMaxRange}
      solarMinRange={solarMinRange}
      solarMaxRange={solarMaxRange}
    />
  );
}

/**
 * Main Map component
 */
const Map = ({ 
  climateData, 
  tempMinValue, 
  tempMaxValue, 
  solarMinValue, 
  solarMaxValue 
}) => {
  // State to toggle debug tools
  const [showDebugTools, setShowDebugTools] = useState(false);
  
  return (
    <div className="map-container">
      {/* Debug panel toggle button */}
      <button 
        className="debug-toggle-btn" 
        onClick={() => setShowDebugTools(!showDebugTools)}
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
      >
        {showDebugTools ? 'Hide' : 'Show'} Debug
      </button>
      
      {/* Only show debug controls when enabled */}
      {showDebugTools && (
        <div className="map-debug-controls">
          <span className="debug-data-count">
            {climateData ? `${climateData.length} data points` : 'No data'}
          </span>
        </div>
      )}
      
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Use direct Leaflet rectangles for heatmap */}
        {climateData && climateData.length > 0 && (
          <MapUpdater 
            data={climateData} 
            tempMinRange={tempMinValue} 
            tempMaxRange={tempMaxValue}
            solarMinRange={solarMinValue}
            solarMaxRange={solarMaxValue}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 