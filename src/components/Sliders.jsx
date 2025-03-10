import React from 'react';

/**
 * Sliders component for temperature and solar intensity controls
 * @param {Object} props - Component props
 * @param {number} props.tempValue - Current temperature value (-20°F to 120°F)
 * @param {number} props.solarValue - Current solar intensity value (0-100, maps to 0-500 W/m²)
 * @param {Function} props.onTempChange - Handler for temperature slider changes
 * @param {Function} props.onSolarChange - Handler for solar intensity slider changes
 */
const Sliders = ({ tempValue, solarValue, onTempChange, onSolarChange }) => {
  return (
    <div className="sliders-container">
      <div className="slider-group">
        <label htmlFor="temp-slider">
          Temperature: {tempValue}°F
        </label>
        <input
          id="temp-slider"
          type="range"
          min="-20"
          max="120"
          value={tempValue}
          onChange={(e) => onTempChange(parseInt(e.target.value, 10))}
          className="temperature-slider"
        />
      </div>
      
      <div className="slider-group">
        <label htmlFor="solar-slider">
          Solar Intensity: {solarValue} ({Math.round(solarValue * 5)} W/m²)
        </label>
        <input
          id="solar-slider"
          type="range"
          min="0"
          max="100"
          value={solarValue}
          onChange={(e) => onSolarChange(parseInt(e.target.value, 10))}
          className="solar-slider"
        />
      </div>
    </div>
  );
};

export default Sliders; 