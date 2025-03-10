import React, { useEffect, useRef } from 'react';
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
 * @param {number} props.tempRange - Temperature threshold value
 * @param {number} props.solarRange - Solar intensity threshold value
 */
function HeatmapOverlay({ data, tempRange, solarRange }) {
  const map = useMap();
  const svgRef = useRef(null);
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      // Clear existing heatmap if no data
      if (heatmapRef.current) {
        d3.select(heatmapRef.current).selectAll("*").remove();
      }
      return;
    }

    // Initialize the SVG overlay if it doesn't exist
    if (!svgRef.current) {
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
      
      // If no visible data, don't render
      if (visibleData.length === 0) return;
      
      // Set up the heatmap
      const heatmapGroup = d3.select(heatmapRef.current);
      
      // For each data point, add a heat rectangle
      visibleData.forEach(point => {
        // Convert lat/lon to pixel coordinates
        const pixelPoint = map.latLngToLayerPoint([point.lat, point.lon]);
        
        // Calculate color based on temperature and solar values
        // Use a scale from blue (cold) to red (hot)
        const tempScale = d3.scaleLinear()
          .domain([-20, 120]) // Temperature range from spec
          .range([0, 1]); // Normalized value
          
        const solarScale = d3.scaleLinear()
          .domain([0, 100]) // Solar intensity range from spec
          .range([0, 1]); // Normalized value
        
        // Normalize the temperature and solar values
        const tempNorm = tempScale(point.temp);
        const solarNorm = solarScale(point.solar);
        
        // Create a combined value (weighted average)
        const combinedValue = (tempNorm + solarNorm) / 2;
        
        // Create a color scale from blue to red
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
          .domain([1, 0]); // Reversed domain for RdYlBu (blue is cold, red is hot)
        
        // Add the heat rectangle
        heatmapGroup.append("rect")
          .attr("x", pixelPoint.x - cellSize / 2)
          .attr("y", pixelPoint.y - cellSize / 2)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("fill", colorScale(combinedValue))
          .attr("opacity", 0.5) // 50% opacity as per spec
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
  }, [map, data, tempRange, solarRange]);

  return null;
}

/**
 * Main Map component
 * @param {Object} props - Component props
 * @param {Array} props.climateData - Climate data for display
 * @param {number} props.tempValue - Temperature value from slider
 * @param {number} props.solarValue - Solar intensity value from slider
 */
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