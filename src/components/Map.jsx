import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Circle, Tooltip } from 'react-leaflet';
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
    // Debugging
    console.log('HeatmapOverlay effect running with data:', data);
    console.log('Current ranges:', { tempMinRange, tempMaxRange, solarMinRange, solarMaxRange });
    
    if (!data || data.length === 0) {
      // Clear existing heatmap if no data
      if (heatmapRef.current) {
        d3.select(heatmapRef.current).selectAll("*").remove();
      }
      console.log('No data available to render heatmap');
      return;
    }

    // Initialize the SVG overlay if it doesn't exist
    if (!svgRef.current) {
      console.log('Creating SVG overlay for heatmap');
      // Create the SVG overlay for the heatmap
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
      console.log('Updating heatmap with', data.length, 'data points');
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      // Clear existing heatmap
      d3.select(heatmapRef.current).selectAll("*").remove();
      
      // Calculate the size of our heat cells based on zoom level
      // A higher zoom level means smaller cells
      const baseSize = 20; // Base size in pixels
      const scaleFactor = Math.pow(1.5, zoom - 3); // Adjust cell size by zoom level
      const cellSize = baseSize / scaleFactor;
      
      // Filter data to points within the current map bounds
      const visibleData = data.filter(point => {
        return bounds.contains([point.lat, point.lon]);
      });
      
      console.log('Visible data points:', visibleData.length);
      
      // If no visible data, don't render
      if (visibleData.length === 0) {
        console.log('No visible data points within current map bounds');
        return;
      }
      
      // Set up the heatmap
      const heatmapGroup = d3.select(heatmapRef.current);
      
      // For each data point, add a heat rectangle
      visibleData.forEach(point => {
        // Convert lat/lon to pixel coordinates
        const pixelPoint = map.latLngToLayerPoint([point.lat, point.lon]);
        
        // Create color scales based on the range values
        const tempScale = d3.scaleLinear()
          .domain([tempMinRange, tempMaxRange])
          .range([0, 1])
          .clamp(true); // Ensure values stay within range
          
        const solarScale = d3.scaleLinear()
          .domain([solarMinRange, solarMaxRange])
          .range([0, 1])
          .clamp(true); // Ensure values stay within range
        
        // Normalize the temperature and solar values within our ranges
        const tempNorm = tempScale(point.temp);
        const solarNorm = solarScale(point.solar);
        
        // Create a combined value (weighted average)
        // We'll visualize more intensely if a point is in the middle of both ranges
        const combinedValue = (tempNorm + solarNorm) / 2;
        
        // Determine the opacity based on how well the point matches our ranges
        // Full opacity (0.7) for perfect matches, fading to 0.1 for edge cases
        const opacity = 0.1 + (combinedValue * 0.6);
        
        // Create a color scale from blue to red
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
          .domain([1, 0]); // Reversed domain for RdYlBu (blue is cold, red is hot)
        
        // Add the heat rectangle
        heatmapGroup.append("rect")
          .attr("x", pixelPoint.x - cellSize / 2)
          .attr("y", pixelPoint.y - cellSize / 2)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("fill", colorScale(tempNorm)) // Color based on temperature
          .attr("opacity", opacity) // Variable opacity based on match quality
          .attr("rx", 2) // Slightly rounded corners
          .attr("ry", 2);
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
 * Fallback component to display markers when D3 heatmap fails
 */
function DataMarkers({ data }) {
  if (!data || data.length === 0) return null;
  
  console.log('Rendering fallback markers for', data.length, 'points');
  
  return (
    <>
      {data.map((point, index) => (
        <Circle
          key={`marker-${index}`}
          center={[point.lat, point.lon]}
          radius={50000} // 50km radius
          pathOptions={{
            fillColor: point.temp > 50 ? 'red' : 'blue',
            fillOpacity: 0.5,
            color: 'white',
            weight: 1
          }}
        >
          <Tooltip>
            Temp: {point.temp.toFixed(1)}°F<br />
            Solar: {point.solar.toFixed(1)} ({Math.round(point.solar * 5)} W/m²)
          </Tooltip>
        </Circle>
      ))}
    </>
  );
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
  // Debugging
  console.log('Map rendering with', climateData ? climateData.length : 0, 'data points');
  
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
        
        {/* Use D3 heatmap overlay for visualization */}
        {climateData && (
          <HeatmapOverlay 
            data={climateData} 
            tempMinRange={tempMinValue} 
            tempMaxRange={tempMaxValue}
            solarMinRange={solarMinValue}
            solarMaxRange={solarMaxValue}
          />
        )}
        
        {/* Fallback to simple markers if needed */}
        {climateData && <DataMarkers data={climateData} />}
      </MapContainer>
    </div>
  );
};

export default Map; 