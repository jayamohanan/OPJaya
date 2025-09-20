# GeoJSON Data Structure

This document explains how the GeoJSON boundary files are stored in **Cloudflare R2** for the Kerala project.  
The structure is designed for **clarity, modularity, and performance** in web delivery.

---

## Folder Structure

- **geojson/**
  - **states/**
    - **outlines/**  
      - Single file: outline of Kerala (one polygon).  
    - **with-districts/**  
      - Single file: Kerala with all districts included (FeatureCollection).  

  - **districts/**
    - **outlines/**  
      - One file per district (outline only). Example: `districts/outlines/kottayam.geojson`.  
    - **with-assemblies/**  
      - One file per district containing all assemblies of that district together (FeatureCollection).  
      - Example: `districts/with-assemblies/kottayam.geojson`.  

  - **assemblies/**
    - **outlines/**  
      - One file per assembly (outline only). Example: `assemblies/outlines/alappuzha.geojson`.  
    - **with-local-bodies/**  
      - One file per assembly containing all local bodies of that assembly together (FeatureCollection).  
      - Example: `assemblies/with-local-bodies/alappuzha.geojson`.  

  - **local-bodies/**
    - **outlines/**  
      - One file per local body (outline only). Example: `local-bodies/outlines/trithala.geojson`.  

---

## Naming Conventions

- **Folders** → plural (e.g., `districts/`, `assemblies/`).  
- **Files** → always named after the **entity only** (no suffix like `-outline` or `-with-assemblies`).  
  - Example:  
    - `districts/outlines/kottayam.geojson` = boundary of Kottayam district.  
    - `districts/with-assemblies/kottayam.geojson` = all assemblies in Kottayam district.  
- **All lowercase** to avoid OS-dependent conflicts.  

---

## Interpretation of Terms

- **outline/**  
  - Contains **only the boundary polygon** of the entity.  

- **with-districts/**, **with-assemblies/**, **with-local-bodies/**  
  - Each file is a **FeatureCollection**, containing all child entities inside the parent.  
  - Context is determined by the folder.  
  - Example:  
    - `districts/with-assemblies/kottayam.geojson` = all assemblies inside Kottayam district.  
    - `assemblies/with-local-bodies/alappuzha.geojson` = all local bodies inside Alappuzha assembly.  

---

## Example Paths

- Kerala outline → `geojson/state/outline/kerala.geojson`  
- All districts together → `geojson/state/with-districts/kerala.geojson`  
- Kottayam district outline → `geojson/districts/outlines/kottayam.geojson`  
- All assemblies in Kottayam district → `geojson/districts/with-assemblies/kottayam.geojson`  
- Alappuzha assembly outline → `geojson/assemblies/outlines/alappuzha.geojson`  
- All local bodies in Alappuzha assembly → `geojson/assemblies/with-local-bodies/alappuzha.geojson`  

---

## Notes

- File names are **"naked" entity names** (just the entity, `.geojson` extension).  
  - The **folder path determines the meaning** (outline vs. packed children).  
- This structure is optimized for **web map rendering**:  
  - Small, modular files → faster fetch and caching.  
  - Hierarchical drilldown possible (state → district → assembly → local body).  
- Updates to one district or assembly do **not** affect the rest of the dataset.  
- Optional: a bulk "all-in-one" export can be generated separately, but is not stored here.