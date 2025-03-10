import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as d3 from 'd3';

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

// Component to handle the heatmap overlay
function HeatmapOverlay({ data, tempRange, solarRange }) {
  const map = useMap();

  useEffect(() => {
    // This will be expanded in future steps to filter data and display the heatmap
    console.log('Map is ready, would render heatmap with:', { tempRange, solarRange });
    
    // Clean up function
    return () => {
      // Clean up any d3 elements when component unmounts
    };
  }, [map, data, tempRange, solarRange]);

  return null;
}

// Main Map component
const Map = ({ climateData, tempValue, solarValue }) => {
  return (
    <div className="map-container">
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
        {climateData && (
          <HeatmapOverlay 
            data={climateData} 
            tempRange={tempValue} 
            solarRange={solarValue} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 