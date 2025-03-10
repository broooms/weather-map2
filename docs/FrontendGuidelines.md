# Frontend Guidelines Document

## Design Principles
- **Simplicity**: Focus on map and sliders; no extraneous elements.
- **Responsiveness**: Adapts to screen size (map full-width, sliders stack on mobile).
- **Performance**: Optimize for <5-second load, smooth redraws.

## UI/UX Standards
- **Map**: OpenStreetMap base layer with 50% opacity heatmap overlay.
- **Sliders**: Range inputs with labels:
  - Temperature: -20°F to 120°F.
  - Solar Intensity: 0–100 (maps to 0–500 W/m² internally).
- **Zoom**: Scroll wheel zooms smoothly, centered on cursor.

## Coding Conventions
- **File Structure**:
  - `src/components/Map.js`: Map rendering logic.
  - `src/components/Sliders.js`: Slider inputs and state.
- **Naming**: CamelCase (e.g., `filterClimateData`).
- **Comments**: JSDoc for key functions (e.g., `/** Updates heatmap based on slider values */`).