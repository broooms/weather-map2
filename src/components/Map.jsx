import React, { useEffect, useRef, useState } from 'react';
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

/**
 * Component to handle the D3 heatmap overlay on the Leaflet map
 * @param {Object} props - Component props
 * @param {Array} props.data - Climate data points for display
 * @param {number} props.tempMinRange - Minimum temperature threshold
 * @param {number} props.tempMaxRange - Maximum temperature threshold
 * @param {number} props.solarMinRange - Minimum solar intensity threshold
 * @param {number} props.solarMaxRange - Maximum solar intensity threshold
 */
function HeatmapOverlay({ data, tempMinRange, tempMaxRange, solarMinRange, solarMaxRange }) {
  const map = useMap();
  const svgRef = useRef(null);
  const heatmapRef = useRef(null);

  useEffect(() => {
    console.log('HeatmapOverlay effect running with data:', data?.length || 0, 'points');
    
    if (!data || data.length === 0) {
      if (heatmapRef.current) {
        d3.select(heatmapRef.current).selectAll("*").remove();
      }
      return;
    }

    // Initialize the SVG overlay if it doesn't exist
    if (!svgRef.current) {
      console.log('Creating SVG overlay for heatmap');
      const svg = d3.select(map.getPanes().overlayPane)
        .append("svg")
        .attr("pointer-events", "none")
        .attr("class", "leaflet-heatmap-layer");
        
      // Add a group for the heatmap elements
      const heatmapGroup = svg.append("g")
        .attr("class", "heatmap-group");
        
      svgRef.current = svg.node();
      heatmapRef.current = heatmapGroup.node();
    }

    // Update the heatmap based on the current map view
    const updateHeatmap = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      // Clear existing heatmap
      d3.select(heatmapRef.current).selectAll("*").remove();
      
      // Calculate the size of our heat cells based on zoom level
      // Start with larger cells that get smaller as we zoom in
      const baseSize = Math.max(30, 100 / Math.pow(1.2, zoom)); // Larger cells at lower zoom levels
      
      // Filter data to points within the current map bounds
      const visibleData = data.filter(point => {
        return bounds.contains([point.lat, point.lon]);
      });
      
      console.log('Rendering heatmap with', visibleData.length, 'visible data points');
      
      // If no visible data, don't render
      if (visibleData.length === 0) return;
      
      // Set up the heatmap
      const heatmapGroup = d3.select(heatmapRef.current);
      
      // Create a color scale based on temperature
      const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
        .domain([120, -20]); // Map temperature range to colors (reverse for blue=cold, red=hot)
      
      // For each data point, add a heat rectangle
      visibleData.forEach(point => {
        // Convert lat/lon to pixel coordinates
        const pixelPoint = map.latLngToLayerPoint([point.lat, point.lon]);
        
        // Check if point is in our ranges
        const inTempRange = point.temp >= tempMinRange && point.temp <= tempMaxRange;
        const inSolarRange = point.solar >= solarMinRange && point.solar <= solarMaxRange;
        
        // Skip points outside our ranges
        if (!inTempRange || !inSolarRange) return;
        
        // Calculate opacity based on how central the values are in our ranges
        const tempRatio = (point.temp - tempMinRange) / (tempMaxRange - tempMinRange);
        const solarRatio = (point.solar - solarMinRange) / (solarMaxRange - solarMinRange);
        
        // Points closer to the middle of the range are more opaque
        const centralFactor = 1 - Math.abs(tempRatio - 0.5) * 2 * 0.5;
        
        // Base opacity on solar value
        const opacity = 0.2 + (solarRatio * 0.6);
        
        // Add the heat rectangle with transition for a smoother appearance
        heatmapGroup.append("rect")
          .attr("x", pixelPoint.x - baseSize / 2)
          .attr("y", pixelPoint.y - baseSize / 2)
          .attr("width", baseSize)
          .attr("height", baseSize)
          .attr("fill", colorScale(point.temp))
          .attr("opacity", opacity)
          .attr("rx", baseSize / 5) // Slightly rounded corners
          .attr("ry", baseSize / 5);
      });
      
      // Update SVG size to match the map
      const mapSize = map.getSize();
      d3.select(svgRef.current)
        .attr("width", mapSize.x)
        .attr("height", mapSize.y);
        
      // Update SVG position to match the map
      const origin = map.layerPointToLatLng([0, 0]);
      const svgOrigin = map.latLngToLayerPoint(origin);
      d3.select(heatmapRef.current)
        .attr("transform", `translate(${-svgOrigin.x},${-svgOrigin.y})`);
    };
    
    // Update heatmap on map zoom and move events
    const onMapChange = () => {
      updateHeatmap();
    };
    
    // Initial update
    updateHeatmap();
    
    // Add event listeners
    map.on('zoom', onMapChange);
    map.on('move', onMapChange);
    
    // Clean up
    return () => {
      map.off('zoom', onMapChange);
      map.off('move', onMapChange);
    };
  }, [map, data, tempMinRange, tempMaxRange, solarMinRange, solarMaxRange]);

  return null;
}

/**
 * Main Map component
 * @param {Object} props - Component props
 * @param {Array} props.climateData - Climate data for display
 * @param {number} props.tempMinValue - Minimum temperature value
 * @param {number} props.tempMaxValue - Maximum temperature value
 * @param {number} props.solarMinValue - Minimum solar intensity value
 * @param {number} props.solarMaxValue - Maximum solar intensity value
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
        
        {/* D3 heatmap overlay */}
        {climateData && (
          <HeatmapOverlay 
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