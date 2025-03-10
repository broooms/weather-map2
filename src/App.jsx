import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Map from './components/Map'
import Sliders from './components/Sliders'
import { debounce } from './utils/debounce'

/**
 * Main App component
 */
function App() {
  // Default values based on the guidelines
  const [tempValue, setTempValue] = useState(50) // Default temperature in °F
  const [solarValue, setSolarValue] = useState(50) // Default solar intensity (0-100)
  const [climateData, setClimateData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch climate data from NASA POWER API
  useEffect(() => {
    // Function to fetch and process climate data
    const fetchClimateData = async () => {
      try {
        setIsLoading(true);
        
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
        
        // Process the data into our required format
        const processedData = processNasaPowerData(data);
        
        setClimateData(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching climate data:', error);
        setError('Error fetching climate data: ' + error.message);
        setIsLoading(false);
        
        // If API fetch fails, use mock data for development
        const mockData = generateMockClimateData();
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
    
    // Generate a 10x10 grid of points (-90 to 90 latitude, -180 to 180 longitude)
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon <= 160; lon += 20) {
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
    
    return mockData;
  };

  /**
   * Filter climate data based on slider values
   * @param {Array} data - Climate data array
   * @param {number} tempThreshold - Temperature threshold from slider
   * @param {number} solarThreshold - Solar intensity threshold from slider
   * @returns {Array} Filtered data array
   */
  const filterClimateData = (data, tempThreshold, solarThreshold) => {
    if (!data) return [];
    
    return data.filter(point => 
      point.temp >= tempThreshold && point.solar >= solarThreshold
    );
  };

  // Create debounced functions for slider changes (100ms delay)
  const debouncedTempChange = useCallback(
    debounce((value) => {
      setTempValue(value);
    }, 100),
    []
  );

  const debouncedSolarChange = useCallback(
    debounce((value) => {
      setSolarValue(value);
    }, 100),
    []
  );

  // Handle slider changes
  const handleTempChange = (value) => {
    debouncedTempChange(value);
  };

  const handleSolarChange = (value) => {
    debouncedSolarChange(value);
  };

  // Filter data based on current slider values
  const filteredData = climateData ? filterClimateData(climateData, tempValue, solarValue) : null;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Interactive Climate Map</h1>
      </header>
      
      <Sliders 
        tempValue={tempValue}
        solarValue={solarValue}
        onTempChange={handleTempChange}
        onSolarChange={handleSolarChange}
      />
      
      {isLoading && <div className="loading">Loading climate data...</div>}
      {error && <div className="error">{error}</div>}
      
      <Map 
        climateData={filteredData}
        tempValue={tempValue}
        solarValue={solarValue}
      />
    </div>
  )
}

export default App
