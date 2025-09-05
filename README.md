# QGIS OpenLayers Map Template

A web-based mapping application template built with OpenLayers and TypeScript, designed for displaying and interacting with geospatial data from QGIS projects. This template is used by the [QGIS OpenLayers Map Plugin](https://github.com/wlatanowicz/qgis-ol-map-plugin) to generate interactive web maps.

## Features

### Supported Layer Types
- **XYZ Tiles** - Tile-based layers with min/max zoom support
- **WMS** - Web Map Service layers
- **WMTS** - Web Map Tile Service layers
- **WFS** - Web Feature Service layers
- **GeoJSON** - Vector data layers
- **KML** - Keyhole Markup Language files
- **GeoTIFF** - Raster image layers
- **Layer Groups** - Hierarchical layer organization

### Map Controls
- **Layer Menu** - Toggle layer visibility and manage layer hierarchy
- **Position Control** - Display current mouse coordinates
- **North Arrow** - Orientation indicator
- **Zoom Controls** - Zoom in/out functionality
- **Scale Line** - Distance reference with metric units
- **Popup Controller** - Interactive feature information display

### Additional Features
- **Clustering** - Point feature clustering for better visualization
- **EPSG Support** - Custom coordinate reference system support
- **Mobile Responsive** - Optimized for mobile devices
- **Bootstrap UI** - Clean, responsive user interface

## Technology Stack

- **Frontend**: TypeScript, OpenLayers 10.6.1, React 19.1.0 (layer management control)
- **State Management**: Redux Toolkit
- **UI Framework**: Bootstrap 5.3.7 (map popups)
- **Build Tool**: Vite 7.0.0
- **Projection**: Proj4js for coordinate transformations

## Development

### Prerequisites
- Node.js (latest LTS version recommended)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format
```

### Configuration

The application uses a configuration system located in the `config/` directory:

- `config/config.ts` - Main configuration file (populated by QGIS plugin)
- `config/configOverride.ts` - Override configuration for customization

Configure your layers, EPSG codes, and viewport settings in these files.

## Project Structure

```
src/
├── controls/          # Map controls (layer menu, position, etc.)
├── layers/            # Layer type implementations
├── state/             # Redux state management
├── utils/             # Utility functions
├── main.ts           # Application entry point
└── style.css         # Global styles
```

## Usage with QGIS Plugin

This template is automatically configured when generating web maps using the [QGIS OpenLayers Map Plugin](https://github.com/wlatanowicz/qgis-ol-map-plugin). The plugin:

1. Exports your QGIS project layers and styling
2. Generates the appropriate configuration files
3. Copies required data and raster files
4. Creates a ready-to-deploy web application

## Browser Support

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive Web App capabilities
