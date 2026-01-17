# 3D Room Storage Organizer

A web-based 3D room planner that helps you organize and visualize your storage spaces. Create multiple rooms, add furniture from a catalog, track stored items, and share your room layouts with others.

## Features

### 🏠 Room Management
- Create and manage multiple rooms
- Rename and delete rooms
- Switch between different room layouts
- Persistent storage using localStorage

### 🪑 Furniture Catalog
- 10+ furniture types including wardrobes, bookcases, cabinets, drawers, and more
- Drag-and-drop placement in 3D space
- Rotate furniture (90° increments)
- Real-time collision detection prevents overlapping
- Automatic boundary constraints keep furniture within room walls

### 📦 Item Tracking
- Add items to each piece of furniture
- Search across all storage boxes to find specific items
- Visual highlighting of storage boxes containing searched items
- Organized item lists with delete functionality

### 🔗 Sharing & Sync
- Generate shareable URLs to sync rooms across devices
- URL-based room state encoding
- Copy share links to clipboard with one click

### 🎨 Interactive 3D Visualization
- Fully 3D room rendering using Three.js
- Orbit camera controls for 360° viewing
- Realistic lighting and shadows
- Color-coded furniture
- Selection highlighting

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Helper utilities for R3F
- **React Router DOM** - Client-side routing
- **localStorage** - Data persistence

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JovanTeo1103/hackandroll.git
cd hackandroll
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Add Furniture**: Click "Add Furniture" to open the catalog and select items to place in your room
2. **Position Items**: Drag furniture pieces to move them around the room
3. **Rotate**: Select a piece and click the rotate button to change orientation
4. **Add Items**: Click on furniture to select it, then use the item panel to add stored items
5. **Search**: Use the search bar to find items across all storage boxes
6. **Manage Rooms**: Create new rooms, switch between them, or rename them using the room panel
7. **Share**: Click the share button to generate a shareable link

## Project Structure

```
src/
├── components/
│   ├── Room.jsx              # 3D room component with walls and floor
│   ├── StorageBox.jsx        # Interactive 3D furniture component
│   ├── ConfirmDialog.jsx     # Confirmation dialog for deletions
│   ├── ErrorPopup.jsx        # Error notification popup
│   └── SuccessPopup.jsx      # Success notification popup
├── data/
│   └── furnitureCatalog.js   # Furniture type definitions
├── styles/
│   ├── ConfirmDialog.css
│   ├── ErrorPopup.css
│   └── SuccessPopup.css
├── App.jsx                   # Main application component
├── App.css                   # Main styles
├── main.jsx                  # Application entry point
└── index.css                 # Global styles
```

## License

MIT
