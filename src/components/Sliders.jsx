import React from 'react';

/**
 * Sliders component for temperature and solar intensity ranges
 * @param {Object} props - Component props
 * @param {number} props.tempMinValue - Minimum temperature value (-20°F to 120°F)
 * @param {number} props.tempMaxValue - Maximum temperature value (-20°F to 120°F)
 * @param {number} props.solarMinValue - Minimum solar intensity value (0-100, maps to 0-500 W/m²)
 * @param {number} props.solarMaxValue - Maximum solar intensity value (0-100, maps to 0-500 W/m²)
 * @param {Function} props.onTempMinChange - Handler for minimum temperature slider changes
 * @param {Function} props.onTempMaxChange - Handler for maximum temperature slider changes
 * @param {Function} props.onSolarMinChange - Handler for minimum solar intensity slider changes
 * @param {Function} props.onSolarMaxChange - Handler for maximum solar intensity slider changes
 */
const Sliders = ({ 
  tempMinValue, 
  tempMaxValue, 
  solarMinValue, 
  solarMaxValue, 
  onTempMinChange, 
  onTempMaxChange, 
  onSolarMinChange, 
  onSolarMaxChange 
}) => {
  // Handler to ensure min doesn't exceed max
  const handleTempMinChange = (value) => {
    onTempMinChange(Math.min(value, tempMaxValue));
  };

  // Handler to ensure max doesn't fall below min
  const handleTempMaxChange = (value) => {
    onTempMaxChange(Math.max(value, tempMinValue));
  };

  // Handler to ensure min doesn't exceed max
  const handleSolarMinChange = (value) => {
    onSolarMinChange(Math.min(value, solarMaxValue));
  };

  // Handler to ensure max doesn't fall below min
  const handleSolarMaxChange = (value) => {
    onSolarMaxChange(Math.max(value, solarMinValue));
  };

  return (
    <div className="sliders-container">
      <div className="slider-group">
        <h3 className="slider-title">Temperature (°F)</h3>
        
        <div className="range-slider">
          <div className="slider-row">
            <label htmlFor="temp-min-slider">
              Min: {tempMinValue}°F
            </label>
            <input
              id="temp-min-slider"
              type="range"
              min="-20"
              max="120"
              value={tempMinValue}
              onChange={(e) => handleTempMinChange(parseInt(e.target.value, 10))}
              className="temperature-slider"
            />
          </div>
          
          <div className="slider-row">
            <label htmlFor="temp-max-slider">
              Max: {tempMaxValue}°F
            </label>
            <input
              id="temp-max-slider"
              type="range"
              min="-20"
              max="120"
              value={tempMaxValue}
              onChange={(e) => handleTempMaxChange(parseInt(e.target.value, 10))}
              className="temperature-slider"
            />
          </div>
          
          <div className="range-display">
            Showing regions: {tempMinValue}°F to {tempMaxValue}°F
          </div>
        </div>
      </div>
      
      <div className="slider-group">
        <h3 className="slider-title">Solar Intensity</h3>
        
        <div className="range-slider">
          <div className="slider-row">
            <label htmlFor="solar-min-slider">
              Min: {solarMinValue} ({Math.round(solarMinValue * 5)} W/m²)
            </label>
            <input
              id="solar-min-slider"
              type="range"
              min="0"
              max="100"
              value={solarMinValue}
              onChange={(e) => handleSolarMinChange(parseInt(e.target.value, 10))}
              className="solar-slider"
            />
          </div>
          
          <div className="slider-row">
            <label htmlFor="solar-max-slider">
              Max: {solarMaxValue} ({Math.round(solarMaxValue * 5)} W/m²)
            </label>
            <input
              id="solar-max-slider"
              type="range"
              min="0"
              max="100"
              value={solarMaxValue}
              onChange={(e) => handleSolarMaxChange(parseInt(e.target.value, 10))}
              className="solar-slider"
            />
          </div>
          
          <div className="range-display">
            Showing regions: {solarMinValue} to {solarMaxValue} ({Math.round(solarMinValue * 5)} to {Math.round(solarMaxValue * 5)} W/m²)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sliders; 