# 3D Assets Configuration Guide

## Overview

The website now has a lightweight 3D viewer optimized for performance. You can use both procedural geometries and custom GLB files for project previews.

## How to Add Custom GLB Files to Projects

### 1. Prepare Your GLB File

- Export your 3D model as `.glb` format (binary GLTF)
- Keep the file size under 2-3MB for optimal performance
- Optimize your model:
  - Remove unnecessary geometry
  - Bake textures where possible
  - Lower polygon count if needed
  - Use efficient materials (avoid complex node setups)

### 2. Upload Your GLB File

- Place your `.glb` file in the `public/models/` directory (create it if it doesn't exist)
- Example: `public/models/my-project.glb`

### 3. Update Project Data

In `data/projects.json`, update the project entry:

```json
{
  "id": 1,
  "title": "My Awesome Project",
  "slug": "my-project",
  "modelFile": "/models/my-project.glb",
  "model": {
    "variant": "icosahedron",
    "color": "#0a1520",
    "wireColor": "#14b8a6"
  },
  "viewerSettings": {
    "cameraFov": 40,
    "modelScale": 1,
    "autoRotateSpeed": 0.4,
    "modelPosition": [0, 0, 0],
    "modelRotation": [0, 0, 0]
  }
}
```

### 4. Fallback to Procedural Models

If no `modelFile` is specified, the viewer will use the procedural geometry defined in `model.variant`:

- `icosahedron` - Default geometric shape
- `torus` - Ring shape
- `torusKnot` - Knot topology
- `sphere` - Perfect sphere
- `octahedron` - 8-sided polyhedron
- `dodecahedron` - 12-sided polyhedron
- `cylinder` - Cylindrical shape
- `cone` - Cone shape

## Viewer Features

- ✅ Auto-rotation for visual appeal
- ✅ Smooth real-time rendering
- ✅ Responsive design
- ✅ Fallback to procedural models
- ✅ Lightweight implementation (~minimal performance impact)

## Performance Tips

1. **GLB File Size**: Keep under 2MB
2. **Polygon Count**: Aim for 10k-100k polygons max
3. **Textures**: Combine multiple textures into atlases
4. **Materials**: Use standard PBR materials
5. **Model Scale**: Test the `modelScale` setting in `viewerSettings`

## Viewer Settings Reference

```typescript
viewerSettings: {
  cameraFov: 40,                    // Camera field of view (30-60 recommended)
  modelScale: 1,                     // Model scale multiplier
  autoRotateSpeed: 0.4,              // Rotation speed (0-2)
  modelPosition: [0, 0, 0],          // [x, y, z] offset position
  modelRotation: [0, 0, 0],          // [x, y, z] rotation in degrees
}
```

## Current Implementation

- Home page: Hero model no longer has scroll-driven animation (smooth continuous rotation only)
- Projects Preview: Uses lightweight viewer with support for custom GLB files
- Smooth Scroll: Implemented with Lenis for butter-smooth scrolling experience
