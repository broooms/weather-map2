import { useState, useEffect } from 'react'
import './App.css'
import Map from './components/Map'
import Sliders from './components/Sliders'

function App() {
  // Default values based on the guidelines
  const [tempValue, setTempValue] = useState(50) // Default temperature in °F
  const [solarValue, setSolarValue] = useState(50) // Default solar intensity (0-100)
  const [climateData, setClimateData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 7: Test NASA POWER API call (initially commented out for testing with mock data)
  useEffect(() => {
    // This will be uncommented in future steps
    // For now, let's just log that we would fetch data
    console.log('Would fetch data from NASA POWER API');
    
    // Mock data for initial testing
    const mockData = {
      message: "Mock climate data loaded successfully"
    };
    
    // Set the mock data
    setClimateData(mockData);
    
    // Actual API call would be:
    /*
    setIsLoading(true);
    fetch('https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=-180&latitude=-90&start=2005&end=2025&format=JSON')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setClimateData(data);
        setIsLoading(false);
      })
      .catch(error => {
        setError('Error fetching climate data: ' + error.message);
        setIsLoading(false);
      });
    */
  }, []);

  // Handle slider changes with debounce functionality in mind
  const handleTempChange = (value) => {
    setTempValue(value);
  };

  const handleSolarChange = (value) => {
    setSolarValue(value);
  };

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
        climateData={climateData}
        tempValue={tempValue}
        solarValue={solarValue}
      />
    </div>
  )
}

export default App
