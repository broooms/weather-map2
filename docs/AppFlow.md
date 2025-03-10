# App Flow Document

## User Journey
1. User loads the webapp in a browser.
2. Sees a full-screen map with sliders for temperature and solar intensity above it.
3. Adjusts sliders; heatmap updates in real-time to highlight matching regions.
4. Scrolls to zoom in/out; map and heatmap adjust smoothly.

## System Architecture
- **Client-Side SPA**: Fully browser-based, hosted statically (e.g., GitHub Pages).
- **Data Fetch**: Loads lightweight JSON data (<5MB) from NASA POWER API on startup.
- **Rendering**: Browser renders map and heatmap using JavaScript libraries.

## Data Flow
1. App sends HTTP request to NASA POWER API for 1° grid data (2005–2025 averages).
2. JSON response cached in memory as a latitude/longitude grid.
3. Slider inputs filter grid data; matching coordinates passed to heatmap renderer.
4. Map updates with semi-transparent heatmap overlay.