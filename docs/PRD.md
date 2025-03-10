# Project Requirements Document (PRD)

## Purpose
A personal webapp for the general public to visualize historical climate data (average temperature and solar radiation) on an interactive global map.

## Goals
- Deliver a simple, working tool to explore climate patterns interactively.
- Ensure it’s lightweight, fast, and easy to deploy.

## Features
- Interactive world map with scroll-wheel zoom.
- Sliders for average temperature (°F) and solar intensity (0–100 scale).
- Semi-transparent heatmap overlay (50% opacity) showing regions matching slider values, with base map visible underneath.
- Real-time updates as sliders are adjusted.

## User Stories
- As a user, I want to move sliders and see the map update instantly, so I can explore climate data fluidly.
- As a user, I want to zoom in/out with my scroll wheel, so I can examine regions in detail or view globally.

## Constraints
- Data: Historical averages (2005–2025) fetched from a web API.
- Lightweight: Target <5MB data size, <5-second initial load time (adjustable based on testing).