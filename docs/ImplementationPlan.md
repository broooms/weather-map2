# Implementation Plan (50 Steps)

## Setup Phase (Steps 1–10)
1. Initialize project: `npm create vite@latest` (select React).
2. Install dependencies: `npm install leaflet react-leaflet d3`.
3. Set up Git repository and push to GitHub.
4. Configure Vite for GitHub Pages deployment (`vite.config.js`).
5. Create `src/components/Map.js` for Leaflet integration.
6. Create `src/components/Sliders.js` for slider inputs.
7. Test NASA POWER API call: `fetch('https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=-180&latitude=-90&start=2005&end=2025&format=JSON')`.
8. Parse JSON response into a 1° grid (lat/long, temp, solar).
9. Mock sliders with static data for initial testing.
10. Run locally: `npm run dev`.

## Development Phase (Steps 11–35)
11. Integrate Leaflet map with OpenStreetMap tiles.
12. Enable scroll-wheel zoom in Leaflet options.
13. Style map container (CSS: `width: 100vw; height: 90vh`).
14. Render sliders with ranges (-20°F to 120°F, 0–100 solar intensity).
15. Use React `useState` for slider values.
16. Fetch real NASA POWER data on app load (`useEffect`).
17. Store data in memory as an array of objects (e.g., `{lat, lon, temp, solar}`).
18. Write `filterClimateData` function to match slider values (convert °F to °C internally, map 0–100 to 0–500 W/m²).
19. Use D3.js to generate heatmap overlay from filtered data.
20. Set heatmap opacity to 0.5 in D3 configuration.
21. Update map on slider change (`onChange` event).
22. Debounce slider updates (e.g., 100ms delay) for performance.
23. Re-render heatmap on zoom events.
24. Test edge cases (e.g., temp = -20°F, solar = 0).
25. Add error handling for API failure (e.g., “Data unavailable” message).
26. Style sliders (CSS: labels above, centered).
27. Ensure map stays visible under heatmap.
28. Optimize data parsing for speed.
29. Test heatmap accuracy with sample coordinates.
30. Add loading state while fetching data.
31. Adjust slider size/position for touchscreens (CSS tweak).
32. Check memory usage with full dataset.
33. Refine zoom behavior for smooth transitions.
34. Test cross-browser compatibility (Chrome, Firefox).
35. Finalize UI layout (map 90%, sliders 10% of screen).

## Testing Phase (Steps 36–45)
36. Measure initial load time (<5s target).
37. Verify data size (<5MB target).
38. Test real-time heatmap updates on slider move.
39. Confirm zoom works on desktop and mobile.
40. Compare heatmap output to known climate data (e.g., equator vs. poles).
41. Debug any lag during slider adjustments.
42. Test with slow network (throttle in DevTools).
43. Ensure no crashes on API error.
44. Validate responsive design on small screens.
45. Final performance tweaks (e.g., reduce D3 redraws).

## Deployment Phase (Steps 46–50)
46. Build project: `npm run build`.
47. Deploy to GitHub Pages: `npm run deploy`.
48. Verify live site loads and functions.
49. Write README with setup/deploy instructions.
50. Share live URL for feedback.