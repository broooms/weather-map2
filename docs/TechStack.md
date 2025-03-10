# Tech Stack Document

## Programming Languages
- **JavaScript**: Core language for logic, UI, and rendering.

## Frameworks/Libraries
- **React**: Manages UI components (sliders, map container).
- **Leaflet.js**: Handles interactive map with zoom and base layer.
- **D3.js**: Generates heatmap overlay from filtered data.

## Tools
- **Vite**: Fast build tool for development and bundling.
- **GitHub Pages**: Free static hosting for deployment.

## Data Source
- **NASA POWER API**: Provides historical climate data (temperature, solar radiation) at 1° resolution (~2-5MB JSON). Example endpoint: `https://power.larc.nasa.gov/api/temporal/monthly/point`.

## Rationale
- Lightweight, client-side stack minimizes complexity.
- Leaflet + D3 ensures efficient map and visualization rendering.
- NASA POWER offers free, granular data via web requests.