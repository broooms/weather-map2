import React, { useRef, useEffect } from 'react';

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
  // Refs for the range slider containers
  const tempRangeRef = useRef(null);
  const solarRangeRef = useRef(null);
  
  // Create visual indicator for range between min and max values
  useEffect(() => {
    const updateRangeStyles = () => {
      if (tempRangeRef.current) {
        const tempMin = (tempMinValue + 20) / 140 * 100; // -20 to 120 -> 0% to 100%
        const tempMax = (tempMaxValue + 20) / 140 * 100; // -20 to 120 -> 0% to 100%
        tempRangeRef.current.style.setProperty('--low', `${tempMin}%`);
        tempRangeRef.current.style.setProperty('--high', `${tempMax}%`);
      }
      
      if (solarRangeRef.current) {
        const solarMin = solarMinValue; // 0 to 100 -> 0% to 100%
        const solarMax = solarMaxValue; // 0 to 100 -> 0% to 100%
        solarRangeRef.current.style.setProperty('--low', `${solarMin}%`);
        solarRangeRef.current.style.setProperty('--high', `${solarMax}%`);
      }
    };
    
    updateRangeStyles();
  }, [tempMinValue, tempMaxValue, solarMinValue, solarMaxValue]);

  return (
    <div className="sliders-container">
      <div className="slider-group">
        <h3 className="slider-title">Temperature (°F)</h3>
        
        <div className="dual-range-slider" ref={tempRangeRef}>
          <div className="range-track">
            <div className="range-selected"></div>
          </div>
          
          <div className="range-inputs">
            <input
              id="temp-min-slider"
              type="range"
              min="-20"
              max="120"
              value={tempMinValue}
              onChange={(e) => onTempMinChange(Math.min(parseInt(e.target.value, 10), tempMaxValue))}
              className="range-min"
            />
            <input
              id="temp-max-slider"
              type="range"
              min="-20"
              max="120"
              value={tempMaxValue}
              onChange={(e) => onTempMaxChange(Math.max(parseInt(e.target.value, 10), tempMinValue))}
              className="range-max"
            />
          </div>
          
          <div className="range-labels">
            <span className="range-min-label">{tempMinValue}°F</span>
            <span className="range-max-label">{tempMaxValue}°F</span>
          </div>
        </div>
      </div>
      
      <div className="slider-group">
        <h3 className="slider-title">Solar Intensity</h3>
        
        <div className="dual-range-slider" ref={solarRangeRef}>
          <div className="range-track">
            <div className="range-selected"></div>
          </div>
          
          <div className="range-inputs">
            <input
              id="solar-min-slider"
              type="range"
              min="0"
              max="100"
              value={solarMinValue}
              onChange={(e) => onSolarMinChange(Math.min(parseInt(e.target.value, 10), solarMaxValue))}
              className="range-min"
            />
            <input
              id="solar-max-slider"
              type="range"
              min="0"
              max="100"
              value={solarMaxValue}
              onChange={(e) => onSolarMaxChange(Math.max(parseInt(e.target.value, 10), solarMinValue))}
              className="range-max"
            />
          </div>
          
          <div className="range-labels">
            <span className="range-min-label">{solarMinValue} ({Math.round(solarMinValue * 5)} W/m²)</span>
            <span className="range-max-label">{solarMaxValue} ({Math.round(solarMaxValue * 5)} W/m²)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sliders; 