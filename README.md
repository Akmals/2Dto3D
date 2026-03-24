# 2D to 3D Creator & Extruder

A powerful, entirely browser-based CAD tool built with React, Vite, and Three.js. This application allows users to upload 2D images and sketch out polygon boundaries over them, which are instantly extruded into 3D shapes. 

By layering multiple independent parts, snapping them together, and using Constructive Solid Geometry (CSG), users can build clean, 3D-printable solid meshes directly from 2D reference images.

## ✨ Features
- **Image Tracing**: Drag, drop, and click to trace outlines directly over your reference images. Build your model shape-by-shape!
- **Layer & Multi-Part System**: Separate your design into distinct layers/parts so you can edit, hide, and manipulate them individually.
- **Extreme Curvature Controls**: Independently control the *Depth*, *Expand (Bevel Size)*, *Curvature*, and *Smoothness* of each layer. With properly configured parameters, you can even squeeze a flat 2D square outline into a perfect 3D sphere!
- **Auto-Snapping & 3D Gizmos**: Grab and drag layers physically in 3D space, or click to auto-align layers flush against the Z-axis of the previous part.
- **Selective CSG Fusion**: Hide the layers you don't want, then click a button to mathematically intersect and union all overlapping parts into one solid, professional-grade 3D model without internal face overlaps!
- **OBJ Exporting**: Export your freshly fused 3D models straight to `.obj` with one click. Ready for Blender, Unity, or your 3D printer.

## 🚀 Installation & Setup

Because this tool relies on high-performance Client-Side rendering and CSG calculations via `three-csg-ts`, no backend API or server is required! Everything runs blazingly fast in your browser.

### 1. Requirements
Ensure you have [Node.js](https://nodejs.org/) installed for package management.

### 2. Install Dependencies
Clone this repository and navigate to the frontend directory:
```bash
cd frontend
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Finally, open your browser and navigate to the local server address (usually `http://localhost:5173`) to start designing in 3D!

## 🛠 Tech Stack
- **React 18** + **Vite**
- **Three.js** & **@react-three/fiber** for robust WebGL rendering.
- **@react-three/drei** for interactive 3D Transform gizmos.
- **three-csg-ts** for Boolean Mesh math (Constructive Solid Geometry).
