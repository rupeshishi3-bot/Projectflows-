import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type LuxuryAtmosphereTheme = 'obsidian_sapphire' | 'royal_gold' | 'emerald_aurora';

interface Luxury3DCanvasProps {
  className?: string;
  intensity?: number;
  interactive?: boolean;
}

export const Luxury3DCanvas: React.FC<Luxury3DCanvasProps> = ({
  className = '',
  intensity = 1.0,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTheme, setActiveTheme] = useState<LuxuryAtmosphereTheme>('obsidian_sapphire');

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.02);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 14);

    // 2. High-Fidelity WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    // Theme Palettes - No wireframes, pure smooth luxury glass, obsidian, and luminous glows
    const themes = {
      obsidian_sapphire: {
        bgGlow1: 0x2563eb, // Sapphire
        bgGlow2: 0x06b6d4, // Cyan
        bgGlow3: 0x4f46e5, // Indigo
        glassOrb: 0x1e293b,
        glassAccent: 0x3b82f6,
        particles: 0x93c5fd,
        ribbonColor: 0x0f172a,
      },
      royal_gold: {
        bgGlow1: 0xd97706, // Amber
        bgGlow2: 0xf59e0b, // Gold
        bgGlow3: 0xb45309, // Deep Gold
        glassOrb: 0x27272a,
        glassAccent: 0xfbbf24,
        particles: 0xfef08a,
        ribbonColor: 0x18181b,
      },
      emerald_aurora: {
        bgGlow1: 0x059669, // Emerald
        bgGlow2: 0x0d9488, // Teal
        bgGlow3: 0x0284c7, // Sky
        glassOrb: 0x132e27,
        glassAccent: 0x34d399,
        particles: 0xa7f3d0,
        ribbonColor: 0x064e3b,
      },
    };

    const colors = themes[activeTheme];

    // 3. Dynamic Moving Point Lights (Casting soft caustic highlights)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 3.0);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(colors.bgGlow1, 6 * intensity, 35);
    light1.position.set(6, 4, 6);
    scene.add(light1);

    const light2 = new THREE.PointLight(colors.bgGlow2, 5 * intensity, 30);
    light2.position.set(-6, -3, 5);
    scene.add(light2);

    const light3 = new THREE.PointLight(colors.bgGlow3, 4 * intensity, 25);
    light3.position.set(0, 6, 4);
    scene.add(light3);

    // 4. Floating Luxury Frosted Glass & Obsidian Spheres (NO WIREFRAME, 100% Smooth Organic)
    const orbs: { mesh: THREE.Mesh; origPos: THREE.Vector3; speed: number; offset: number }[] = [];
    const orbGeometries = [
      new THREE.SphereGeometry(1.6, 64, 64),
      new THREE.SphereGeometry(2.2, 64, 64),
      new THREE.SphereGeometry(1.2, 48, 48),
      new THREE.SphereGeometry(1.8, 64, 64),
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.SphereGeometry(1.4, 48, 48),
    ];

    // Ultra-premium Physical Glass / Obsidian Materials with high clearcoat and velvet sheen
    const glassMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: colors.glassOrb,
        roughness: 0.12,
        metalness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.95,
        transparent: true,
        opacity: 0.85,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x090d16,
        roughness: 0.25,
        metalness: 0.95,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      }),
      new THREE.MeshPhysicalMaterial({
        color: colors.glassAccent,
        roughness: 0.15,
        metalness: 0.3,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.35,
      }),
    ];

    const initialPositions = [
      new THREE.Vector3(-7.5, 3.2, -2.5),
      new THREE.Vector3(8.0, 2.0, -3.5),
      new THREE.Vector3(-5.0, -3.2, 1.0),
      new THREE.Vector3(6.5, -3.5, 0.5),
      new THREE.Vector3(-1.5, 5.0, -4.0),
      new THREE.Vector3(2.5, -4.2, -1.0),
    ];

    initialPositions.forEach((pos, idx) => {
      const geo = orbGeometries[idx % orbGeometries.length];
      const mat = glassMaterials[idx % glassMaterials.length];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      scene.add(mesh);
      orbs.push({
        mesh,
        origPos: pos.clone(),
        speed: 0.3 + idx * 0.12,
        offset: idx * 1.5,
      });
    });

    // 5. Smooth Liquid Wave Ribbon (NO WIREFRAME - Pure Smooth Shaded Liquid Metallic Silk)
    const curvePoints = [];
    for (let i = 0; i <= 30; i++) {
      const u = (i / 30) * Math.PI * 2;
      curvePoints.push(
        new THREE.Vector3(
          Math.sin(u) * 9,
          Math.cos(u * 2) * 2.5 - 1.5,
          Math.sin(u * 3) * 3 - 2
        )
      );
    }
    const ribbonCurve = new THREE.CatmullRomCurve3(curvePoints, true);
    const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 80, 0.8, 24, true);
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: colors.ribbonColor,
      roughness: 0.18,
      metalness: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.7,
    });
    const liquidRibbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(liquidRibbon);

    // 6. Luminous Stardust & Micro-Bokeh Particle Field
    const particleCount = 380;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleCoords[i * 3] = (Math.random() - 0.5) * 38;
      particleCoords[i * 3 + 1] = (Math.random() - 0.5) * 26;
      particleCoords[i * 3 + 2] = (Math.random() - 0.5) * 22;
      particleScales[i] = Math.random() * 0.8 + 0.2;
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particleCoords, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: colors.particles,
      size: 0.14,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse Cursor Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = normX * 1.8;
      mouseY = normY * 1.2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. 60FPS Smooth Harmonic Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth floating harmonic movement for glass orbs (Gentle breathing motion)
      orbs.forEach((item) => {
        item.mesh.position.y = item.origPos.y + Math.sin(t * item.speed + item.offset) * 0.6;
        item.mesh.position.x = item.origPos.x + Math.cos(t * item.speed * 0.7 + item.offset) * 0.4;
        item.mesh.rotation.y = t * 0.15;
      });

      // Liquid silk ribbon rotation & gentle undulating deformation
      liquidRibbon.rotation.y = t * 0.04;
      liquidRibbon.rotation.x = Math.sin(t * 0.08) * 0.15;

      // Slowly rotating ambient stardust field
      particles.rotation.y = t * 0.015;
      particles.rotation.x = t * 0.008;

      // Orbiting dynamic light sources for continuous specular caustics
      light1.position.x = Math.sin(t * 0.45) * 9;
      light1.position.y = Math.cos(t * 0.35) * 7 + 1;
      light2.position.x = -Math.cos(t * 0.4) * 8;
      light2.position.y = -Math.sin(t * 0.5) * 6;

      // Physics-damped smooth camera parallax
      targetCameraX += (mouseX - targetCameraX) * 0.04;
      targetCameraY += (mouseY - targetCameraY) * 0.04;
      camera.position.x = targetCameraX;
      camera.position.y = targetCameraY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    // 10. Memory Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      orbGeometries.forEach((g) => g.dispose());
      glassMaterials.forEach((m) => m.dispose());
      ribbonGeo.dispose();
      ribbonMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [intensity, interactive, activeTheme]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
