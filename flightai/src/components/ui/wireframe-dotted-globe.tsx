"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
}

export default function ConvergingEarth({ className = "" }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || hasStartedRef.current) return
    hasStartedRef.current = true;

    const canvas = canvasRef.current
    const context = canvas.getContext("2d", { alpha: true, antialias: false }) as CanvasRenderingContext2D
    if (!context) return

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1200;
    const radius = Math.min(containerWidth, containerHeight) * 0.22; 

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }
      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry
      if (geometry.type === "Polygon") {
        if (!pointInPolygon(point, geometry.coordinates[0])) return false
        for (let i = 1; i < geometry.coordinates.length; i++) {
          if (pointInPolygon(point, geometry.coordinates[i])) return false
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) return true
          }
        }
        return false
      }
      return false
    }

    interface DotData {
      lng: number | null
      lat: number | null
      gridX: number
      gridZ: number
      baseScreenX: number
      baseScreenY: number
      controlX: number
      controlY: number
      delayMs: number
      durationMs: number
      colorHex: string
      targetSize: number
      isVisible: boolean
    }

    const allDots: DotData[] = []
    
    const colors = [
      "#94A3B8", // muted (70%)
      "#CBD5E1", // secondary (20%)
      "#60A5FA", // light blue (7%)
      "#155EEF", // primary blue (2.5%)
      "#14F1D9"  // cyan (0.5%)
    ]

    // Creating a perfectly dense 3D terrain grid
    const cols = 80;
    const rows = 80;
    const INSTANT_DOTS = cols * rows; // 6,400 dots for perfect performance vs density balance

    const planeWidth = containerWidth * 4.0;
    const planeDepth = 4500;
    const fov = 500; // Deep perspective
    const floorY = 250; // Distance below the camera

    for (let r = 0; r < rows; r++) {
       for (let c = 0; c < cols; c++) {
          const gridX = (c / (cols - 1) - 0.5) * planeWidth;
          const gridZ = (r / (rows - 1)) * planeDepth;
          
          const scale = fov / (fov + gridZ);
          const baseScreenX = (gridX * scale) + (containerWidth / 2);
          const baseScreenY = (floorY * scale) + (containerHeight / 2) + 150; // Shift down so it fills the bottom

          // Control point for smooth swooping arc
          const twist = gridX > 0 ? -150 : 150;
          const controlX = baseScreenX + twist; 
          const controlY = baseScreenY - 400 - (gridZ * 0.1);

          // Hold the majestic wave state for 3 seconds, then slowly peel back to globe
          const distToCenter = Math.sqrt(gridX * gridX + (gridZ * gridZ * 0.5));
          const delayMs = 3000 + (distToCenter * 0.4) + (Math.random() * 200);
          const durationMs = 4500 + Math.random() * 3000;

          const colorRoll = Math.random();
          let colorHex = colors[0];
          if (colorRoll > 0.70) colorHex = colors[1];
          if (colorRoll > 0.90) colorHex = colors[2];
          if (colorRoll > 0.98) colorHex = colors[3];
          if (colorRoll > 0.995) colorHex = colors[4];

          // Noticeably larger particle sizes for maximum visibility and presence
          const targetSize = Math.random() > 0.95 ? 2.5 : (Math.random() > 0.5 ? 2.0 : 1.5);

          allDots.push({
            lng: null,
            lat: null,
            gridX,
            gridZ,
            baseScreenX,
            baseScreenY,
            controlX,
            controlY,
            delayMs,
            durationMs,
            colorHex,
            targetSize,
            isVisible: true
          });
       }
    }

    // Sort by Z for proper 3D rendering occlusion
    allDots.sort((a, b) => b.gridZ - a.gridZ);

    const tempDots: {lng: number, lat: number}[] = [];

    const gatherDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds
      // High resolution globe
      const stepSize = (window.innerWidth < 768) ? dotSpacing * 0.12 : dotSpacing * 0.07
      
      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          if (pointInFeature([lng, lat], feature)) {
            tempDots.push({ lng, lat });
          }
        }
      }
    }

    // --- INTERACTION STATE ---
    let rotation: [number, number] = [0, 0];
    let autoRotate = true;
    const baseRotationSpeed = 0.3; 
    
    let mouseX = containerWidth / 2;
    let mouseY = containerHeight / 2;
    let targetMouseX = containerWidth / 2;
    let targetMouseY = containerHeight / 2;

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.25
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY
        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1])) 
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        setTimeout(() => { autoRotate = true }, 2500) 
      }
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
       targetMouseX = e.clientX;
       targetMouseY = e.clientY;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const scaleFactor = event.deltaY > 0 ? 0.95 : 1.05
      const newRadius = Math.max(containerWidth * 0.1, Math.min(containerWidth * 1.0, projection.scale() * scaleFactor))
      projection.scale(newRadius)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("mousemove", handleGlobalMouseMove)

    // --- ANIMATION LOOP ---
    const startTime = performance.now();
    const easeQuartInOut = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    const bezierInterpolate = (p0: number, p1: number, p2: number, t: number) => {
      const u = 1 - t;
      return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    };

    const render = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      context.clearRect(0, 0, containerWidth, containerHeight)
      
      let globeOpacity = 0;
      if (elapsed > 3500) {
        globeOpacity = Math.min(1, (elapsed - 3500) / 4000); 
      }

      if (elapsed > 3500 && autoRotate) {
        rotation[0] += baseRotationSpeed;
      }
      
      const parallaxX = (mouseX / containerWidth - 0.5) * 2;
      const parallaxY = (mouseY / containerHeight - 0.5) * 2;

      let currentRotation: [number, number, number] = [rotation[0], rotation[1], 0];
      if (globeOpacity > 0) {
         currentRotation[0] += parallaxX * -15; 
         currentRotation[1] += parallaxY * 15;
      }
      projection.rotate(currentRotation);
      const currentScale = projection.scale();

      // --- DRAW BACKGROUND SPHERE ---
      if (globeOpacity > 0) {
        context.globalAlpha = 1.0;
        context.beginPath()
        context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
        context.fillStyle = `rgba(5, 11, 20, ${0.9 * globeOpacity})`
        context.fill()
        context.strokeStyle = `rgba(21, 94, 239, ${0.15 * globeOpacity})`
        context.lineWidth = 1
        context.stroke()
      }

      const center = projection.invert!([containerWidth / 2, containerHeight / 2]);
      // Removed globalCompositeOperation="screen" to drastically improve rendering performance
      // Using pure solid colors for 12,000+ dots is much faster

      allDots.forEach(dot => {
        if (!dot.isVisible) return;

        let t = 0;
        if (elapsed > dot.delayMs) {
          t = Math.min(1, (elapsed - dot.delayMs) / dot.durationMs);
        }
        
        const easedT = easeQuartInOut(t);
        
        // --- 3D WAVE TERRAIN CALCULATIONS ---
        // Complex multi-frequency wave (simulates Perlin Noise)
        const waveY = (
           Math.sin(dot.gridX * 0.002 + elapsed * 0.001) * 60 +
           Math.cos(dot.gridZ * 0.0015 + elapsed * 0.0008) * 60 +
           Math.sin((dot.gridX + dot.gridZ) * 0.001 - elapsed * 0.0005) * 40
        );
        
        // 3D Parallax shift based on mouse
        const pShiftX = parallaxX * 250;
        const pShiftY = parallaxY * 100;
        
        const currentWorldY = floorY + waveY + pShiftY;
        const currentWorldX = dot.gridX + pShiftX;
        
        // Project 3D terrain to 2D screen
        const scale = fov / (fov + dot.gridZ);
        const waveScreenX = (currentWorldX * scale) + (containerWidth / 2);
        const waveScreenY = (currentWorldY * scale) + (containerHeight / 2) + 150;
        
        // Larger initial wave sizes
        const waveSize = Math.max(0.5, dot.targetSize * scale * 3.5);

        // --- GLOBE TARGET CALCULATIONS ---
        let targetX = dot.baseScreenX;
        let targetY = dot.baseScreenY - 300; 
        let isFront = true;

        if (dot.lng !== null && dot.lat !== null) {
            const projected = projection([dot.lng, dot.lat]);
            if (projected) {
                targetX = projected[0];
                targetY = projected[1];
                if (center) {
                    isFront = d3.geoDistance([dot.lng, dot.lat], center) < Math.PI / 2;
                }
            }
        }

        // --- FINAL INTERPOLATION ---
        let currentX, currentY, currentSize;
        if (easedT > 0 && easedT < 1) {
          currentX = bezierInterpolate(waveScreenX, dot.controlX, targetX, easedT);
          currentY = bezierInterpolate(waveScreenY, dot.controlY, targetY, easedT);
          currentSize = waveSize + ((dot.targetSize - waveSize) * easedT);
        } else if (easedT === 1) {
          currentX = targetX;
          currentY = targetY;
          currentSize = dot.targetSize;
        } else {
          currentX = waveScreenX;
          currentY = waveScreenY;
          currentSize = waveSize;
        }

        // --- OPACITY & RENDERING ---
        let opacity = 1.0;
        if (easedT === 1) {
           opacity = isFront ? 1.0 : 0.15;
           if (dot.lng !== null && dot.lat !== null && center) {
             const distToEdge = d3.geoDistance([dot.lng, dot.lat], center);
             if (distToEdge > (Math.PI / 2) * 0.8) {
                opacity *= 1.0 - ((distToEdge - (Math.PI / 2) * 0.8) / ((Math.PI / 2) * 0.2));
             }
           }
        } else {
           // Horizon fade
           const horizonFade = Math.max(0, 1 - (dot.gridZ / planeDepth));
           if (elapsed < 1000) {
             opacity = (elapsed / 1000) * horizonFade;
           } else {
             opacity = horizonFade + ((1.0 - horizonFade) * easedT);
           }
        }
        
        if (opacity <= 0.01) return;

        context.globalAlpha = opacity;
        context.fillStyle = dot.colorHex;
        
        // Fast render using fillRect instead of arc for massive performance boost
        // For tiny particles (<1.5px), squares look identical to circles but render 10x faster
        const rSize = Math.max(0.5, currentSize);
        context.fillRect(
           Math.round(currentX - rSize/2), 
           Math.round(currentY - rSize/2), 
           rSize, 
           rSize
        );
      })

      context.globalAlpha = 1.0;
    }

    const timer = d3.timer(render);

    const loadWorldData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")
        
        const landFeatures = await response.json()
        landFeatures.features.forEach((feature: any) => gatherDotsInPolygon(feature, 12))
        
        d3.shuffle(tempDots);
        
        tempDots.forEach((tempDot, i) => {
            if (i < allDots.length) {
                allDots[i].lng = tempDot.lng;
                allDots[i].lat = tempDot.lat;
                allDots[i].isVisible = true;
            } else {
                // Dynamic overflow spawn
                const gridX = (Math.random() - 0.5) * planeWidth;
                const gridZ = 4000 + Math.random() * 2000; 
                
                const scale = fov / (fov + gridZ);
                const baseScreenX = (gridX * scale) + (containerWidth / 2);
                const baseScreenY = (floorY * scale) + (containerHeight / 2) + 150;

                const twist = gridX > 0 ? -150 : 150;
                const controlX = baseScreenX + twist; 
                const controlY = baseScreenY - 400 - (gridZ * 0.1);

                allDots.push({
                  lng: tempDot.lng,
                  lat: tempDot.lat,
                  gridX,
                  gridZ,
                  baseScreenX,
                  baseScreenY,
                  controlX,
                  controlY,
                  delayMs: 3000 + (gridZ * 0.3),
                  durationMs: 4500 + Math.random() * 3000,
                  colorHex: colors[1],
                  targetSize: Math.random() > 0.5 ? 1.2 : 0.8,
                  isVisible: true
                });
            }
        });
        
        if (tempDots.length < allDots.length) {
            for (let i = tempDots.length; i < allDots.length; i++) {
                allDots[i].isVisible = false;
            }
        }
        
        allDots.sort((a, b) => b.gridZ - a.gridZ);
      } catch (err) {
        setError("Failed to load map data")
      }
    }

    loadWorldData()

    return () => {
      timer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [className])

  if (error) return null;

  return (
    <div className={`fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden mix-blend-screen`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent pointer-events-auto"
        style={{ cursor: 'grab' }}
      />
    </div>
  )
}
