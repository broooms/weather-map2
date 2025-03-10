import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Map from './components/Map'
import Sliders from './components/Sliders'
import { debounce } from './utils/debounce'

/**
 * Main App component
 */
function App() {
  // Initialize state with range values
  const [tempMinValue, setTempMinValue] = useState(-10) // Default min temperature in °F
  const [tempMaxValue, setTempMaxValue] = useState(90) // Default max temperature in °F
  const [solarMinValue, setSolarMinValue] = useState(20) // Default min solar intensity (0-100)
  const [solarMaxValue, setSolarMaxValue] = useState(80) // Default max solar intensity (0-100)
  const [climateData, setClimateData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDebugPanel, setShowDebugPanel] = useState(false) // Debug panel toggle

  // Fetch climate data from NASA POWER API
  useEffect(() => {
    // Function to fetch and process climate data
    const fetchClimateData = async () => {
      try {
        setIsLoading(true);
        
        // DEBUG: Use mock data for initial development
        console.log('Using mock data for development...');
        const mockData = generateMockClimateData();
        setClimateData(mockData);
        setIsLoading(false);
        
        // Comment this out to skip API call during debugging
        /*
        console.log('Attempting to fetch NASA POWER data...');
        
        // Sample point to start - we'll expand this to multiple points in a grid
        const response = await fetch(
          'https://power.larc.nasa.gov/api/temporal/monthly/point' +
          '?parameters=T2M,ALLSKY_SFC_SW_DWN' +
          '&community=RE' +
          '&longitude=0' +
          '&latitude=0' +
          '&start=2005' +
          '&end=2015' +
          '&format=JSON'
        );
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('NASA POWER API response:', data);
        
        // Process the data into our required format
        const processedData = processNasaPowerData(data);
        console.log('Processed climate data:', processedData);
        
        setClimateData(processedData);
        setIsLoading(false);
        */
      } catch (error) {
        console.error('Error fetching climate data:', error);
        setError('Error fetching climate data: ' + error.message);
        setIsLoading(false);
        
        console.log('Falling back to mock data...');
        // If API fetch fails, use mock data for development
        const mockData = generateMockClimateData();
        console.log('Generated mock data:', mockData);
        setClimateData(mockData);
      }
    };
    
    fetchClimateData();
  }, []);

  /**
   * Process NASA POWER API data into a format suitable for our app
   * @param {Object} rawData - Raw data from NASA POWER API
   * @returns {Array} Processed data array with lat, lon, temp, and solar values
   */
  const processNasaPowerData = (rawData) => {
    try {
      // Extract coordinates
      const latitude = rawData.geometry.coordinates[1];
      const longitude = rawData.geometry.coordinates[0];
      
      // Extract temperature and solar radiation values
      const tempData = rawData.properties.parameter.T2M;
      const solarData = rawData.properties.parameter.ALLSKY_SFC_SW_DWN;
      
      // Calculate averages across all months and years
      let tempSum = 0;
      let solarSum = 0;
      let count = 0;
      
      // Sum up all values
      for (const year in tempData) {
        for (const month in tempData[year]) {
          tempSum += tempData[year][month];
          solarSum += solarData[year][month];
          count++;
        }
      }
      
      // Calculate averages
      const tempAvg = tempSum / count;
      const solarAvg = solarSum / count;
      
      // Convert temperature from Celsius to Fahrenheit
      const tempF = (tempAvg * 9/5) + 32;
      
      // Map solar radiation (W/m²) to our 0-100 scale
      // NASA POWER typically provides values between 0-500 W/m²
      const solarScaled = Math.min(100, Math.max(0, solarAvg / 5));
      
      // Return as a simple object for now - we'll expand this to a grid later
      return [{
        lat: latitude,
        lon: longitude,
        temp: tempF,
        solar: solarScaled
      }];
    } catch (error) {
      console.error('Error processing NASA POWER data:', error);
      return [];
    }
  };

  /**
   * Generate mock climate data for development and testing
   * @returns {Array} Array of mock climate data points
   */
  const generateMockClimateData = () => {
    // Create a grid of points covering the globe
    const mockData = [];
    
    // Generate a denser grid of points for better visibility
    for (let lat = -80; lat <= 80; lat += 10) {  // More density (10° increments)
      for (let lon = -180; lon <= 170; lon += 10) {  // More density (10° increments)
        // Temperature decreases from equator to poles (approximate model)
        const baseTemp = 80 - Math.abs(lat) * 1.2;
        // Add some randomness
        const temp = baseTemp + (Math.random() * 20 - 10);
        
        // Solar intensity is highest at equator, lower at poles
        const baseSolar = 100 - Math.abs(lat) * 0.8;
        // Add some randomness
        const solar = Math.max(0, Math.min(100, baseSolar + (Math.random() * 20 - 10)));
        
        mockData.push({
          lat,
          lon,
          temp,
          solar
        });
      }
    }
    
    console.log(`Generated ${mockData.length} mock data points`);
    
    // Add a few well-known reference points that should always be visible
    const referencePoints = [
      { lat: 0, lon: 0, temp: 80, solar: 90, name: "Equator" },       // Equator
      { lat: 40, lon: -100, temp: 60, solar: 70, name: "North America" },  // North America
      { lat: 50, lon: 10, temp: 50, solar: 60, name: "Europe" },      // Europe
      { lat: -30, lon: 150, temp: 70, solar: 80, name: "Australia" }  // Australia
    ];
    
    referencePoints.forEach(point => {
      mockData.push(point);
      console.log(`Added reference point: ${point.name} at ${point.lat},${point.lon}`);
    });
    
    return mockData;
  };

  /**
   * Filter climate data based on range slider values
   * @param {Array} data - Climate data array
   * @param {number} tempMin - Minimum temperature threshold
   * @param {number} tempMax - Maximum temperature threshold
   * @param {number} solarMin - Minimum solar intensity threshold
   * @param {number} solarMax - Maximum solar intensity threshold
   * @returns {Array} Filtered data array
   */
  const filterClimateData = (data, tempMin, tempMax, solarMin, solarMax) => {
    if (!data) return [];
    
    const filtered = data.filter(point => 
      point.temp >= tempMin && 
      point.temp <= tempMax && 
      point.solar >= solarMin && 
      point.solar <= solarMax
    );
    
    console.log(`Filtered data: ${filtered.length} points match criteria (from ${data.length} total points)`);
    return filtered;
  };

  // Create debounced functions for slider changes (100ms delay)
  const debouncedTempMinChange = useCallback(
    debounce((value) => {
      setTempMinValue(value);
    }, 100),
    []
  );

  const debouncedTempMaxChange = useCallback(
    debounce((value) => {
      setTempMaxValue(value);
    }, 100),
    []
  );

  const debouncedSolarMinChange = useCallback(
    debounce((value) => {
      setSolarMinValue(value);
    }, 100),
    []
  );

  const debouncedSolarMaxChange = useCallback(
    debounce((value) => {
      setSolarMaxValue(value);
    }, 100),
    []
  );

  // Handle slider changes
  const handleTempMinChange = (value) => {
    debouncedTempMinChange(value);
  };

  const handleTempMaxChange = (value) => {
    debouncedTempMaxChange(value);
  };

  const handleSolarMinChange = (value) => {
    debouncedSolarMinChange(value);
  };

  const handleSolarMaxChange = (value) => {
    debouncedSolarMaxChange(value);
  };

  // Filter data based on current slider values
  const filteredData = climateData ? 
    filterClimateData(climateData, tempMinValue, tempMaxValue, solarMinValue, solarMaxValue) : 
    null;

  // Debug panel to display internal state
  function DebugPanel({ state }) {
    return (
      <div className="debug-panel">
        <h3>Debug Info</h3>
        <div className="debug-content">
          <div><strong>Loading:</strong> {state.isLoading ? 'Yes' : 'No'}</div>
          <div><strong>Error:</strong> {state.error || 'None'}</div>
          <div><strong>Data Points:</strong> {state.climateData ? state.climateData.length : 0}</div>
          <div><strong>Filtered Points:</strong> {state.filteredData ? state.filteredData.length : 0}</div>
          <div><strong>Temperature Range:</strong> {state.tempMinValue}°F to {state.tempMaxValue}°F</div>
          <div><strong>Solar Range:</strong> {state.solarMinValue} to {state.solarMaxValue}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Interactive Climate Map</h1>
        {/* Add debugging data indicator */}
        <small style={{ fontSize: '0.7rem', opacity: 0.8 }}>
          {isLoading ? 'Loading...' : 
           error ? 'Error loading data' :
           climateData ? `${climateData.length} data points loaded` : 'No data'}
        </small>
      </header>
      
      <Sliders 
        tempMinValue={tempMinValue}
        tempMaxValue={tempMaxValue}
        solarMinValue={solarMinValue}
        solarMaxValue={solarMaxValue}
        onTempMinChange={handleTempMinChange}
        onTempMaxChange={handleTempMaxChange}
        onSolarMinChange={handleSolarMinChange}
        onSolarMaxChange={handleSolarMaxChange}
      />
      
      {isLoading && <div className="loading">Loading climate data...</div>}
      {error && <div className="error">{error}</div>}
      
      <Map 
        climateData={filteredData}
        tempMinValue={tempMinValue}
        tempMaxValue={tempMaxValue}
        solarMinValue={solarMinValue}
        solarMaxValue={solarMaxValue}
      />
      
      {/* Add debug panel only when showDebugPanel is true */}
      {showDebugPanel && (
        <DebugPanel state={{
          isLoading,
          error,
          climateData,
          filteredData,
          tempMinValue,
          tempMaxValue,
          solarMinValue,
          solarMaxValue
        }} />
      )}
      
      {/* Button to toggle debug panel */}
      <button 
        className="debug-panel-toggle"
        onClick={() => setShowDebugPanel(!showDebugPanel)}
      >
        {showDebugPanel ? 'Hide' : 'Show'} Debug Panel
      </button>
    </div>
  )
}

export default App
