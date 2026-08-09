'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

interface Parcel3DCanvasProps {
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  orderId?: string;
}

export default function Parcel3DCanvas({ status, orderId }: Parcel3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lidGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef({ x: 0.2, y: 0.4 });
  const currentRotationRef = useRef({ x: 0.2, y: 0.4 });

  useEffect(() => {
    if (status === 'completed') {
      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2e7d32', '#d97706', '#10b981', '#fbbf24', '#ffffff'],
      });
    }
  }, [status]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 280;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.04);

    // 2. Camera setup - Centered right on parcel body
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.6);
    camera.lookAt(0, 0.7, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    mainLight.position.set(4, 6, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xa7f3d0, 0.9);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf59e0b, 1.5, 8);
    rimLight.position.set(0, 2.5, 0);
    scene.add(rimLight);

    // 5. Build Parcel Model
    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    // Box Body (Kraft Paper / Artisan Wood Texture)
    const boxMat = new THREE.MeshStandardMaterial({
      color: status === 'cancelled' ? 0x94a3b8 : 0xd2a679,
      roughness: 0.7,
      metalness: 0.1,
    });

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: status === 'cancelled' ? 0x64748b : 0x2e7d32,
      roughness: 0.4,
      metalness: 0.2,
    });

    const sealMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.3,
      metalness: 0.4,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });

    // Box base
    const boxGeo = new THREE.BoxGeometry(1.8, 1.2, 1.8);
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.y = 0.6;
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    parcelGroup.add(boxMesh);

    // Horizontal ribbon
    const hRibbonGeo = new THREE.BoxGeometry(1.82, 1.22, 0.26);
    const hRibbon = new THREE.Mesh(hRibbonGeo, ribbonMat);
    hRibbon.position.y = 0.6;
    parcelGroup.add(hRibbon);

    // Vertical ribbon
    const vRibbonGeo = new THREE.BoxGeometry(0.26, 1.22, 1.82);
    const vRibbon = new THREE.Mesh(vRibbonGeo, ribbonMat);
    vRibbon.position.y = 0.6;
    parcelGroup.add(vRibbon);

    // Box Lid (Can open when completed)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.2, -0.9); // Pivot at back edge
    parcelGroup.add(lidGroup);
    lidGroupRef.current = lidGroup;

    const lidGeo = new THREE.BoxGeometry(1.86, 0.2, 1.86);
    const lidMesh = new THREE.Mesh(lidGeo, boxMat);
    lidMesh.position.set(0, 0.1, 0.9);
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // Lid Ribbon Cross
    const lidHGeo = new THREE.BoxGeometry(1.88, 0.22, 0.26);
    const lidH = new THREE.Mesh(lidHGeo, ribbonMat);
    lidH.position.set(0, 0.1, 0.9);
    lidGroup.add(lidH);

    const lidVGeo = new THREE.BoxGeometry(0.26, 0.22, 1.88);
    const lidV = new THREE.Mesh(lidVGeo, ribbonMat);
    lidV.position.set(0, 0.1, 0.9);
    lidGroup.add(lidV);

    // Artisan Wax Seal on Top
    const sealGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.set(0, 0.24, 0.9);
    lidGroup.add(seal);

    // Ribbon Bow knot
    const knotGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
    const knot1 = new THREE.Mesh(knotGeo, ribbonMat);
    knot1.rotation.x = Math.PI / 2;
    knot1.position.set(0.12, 0.26, 0.9);
    lidGroup.add(knot1);

    const knot2 = new THREE.Mesh(knotGeo, ribbonMat);
    knot2.rotation.x = Math.PI / 2;
    knot2.position.set(-0.12, 0.26, 0.9);
    lidGroup.add(knot2);

    // Glowing core gift inside if completed
    const giftCoreGeo = new THREE.OctahedronGeometry(0.35, 1);
    const giftCore = new THREE.Mesh(giftCoreGeo, goldMat);
    giftCore.position.set(0, 0.85, 0);
    giftCore.visible = status === 'completed';
    parcelGroup.add(giftCore);

    // 6. Floating Particles (Magical dust)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 4;
      particlePos[i + 1] = Math.random() * 2.8 + 0.2;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: status === 'completed' ? 0xf59e0b : 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Ground shadow plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Mouse move interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationRef.current = {
        x: y * 0.35 + 0.15,
        y: x * 0.75 + 0.4,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / parcel rotation lerp
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.05;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.05;

      parcelGroup.rotation.x = currentRotationRef.current.x;
      parcelGroup.rotation.y = currentRotationRef.current.y + Math.sin(elapsedTime * 0.6) * 0.1;

      // Status-specific physics
      if (status === 'pending') {
        // Floating breathe
        parcelGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
        if (lidGroup) lidGroup.rotation.x = 0;
      } else if (status === 'processing') {
        // Packing wobble
        parcelGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.1;
        parcelGroup.rotation.z = Math.sin(elapsedTime * 3) * 0.03;
        if (lidGroup) lidGroup.rotation.x = Math.sin(elapsedTime * 2) * 0.05;
      } else if (status === 'shipping') {
        // Road riding vibration
        parcelGroup.position.y = Math.sin(elapsedTime * 5.0) * 0.06;
        parcelGroup.rotation.z = Math.sin(elapsedTime * 4.0) * 0.04;
        if (lidGroup) lidGroup.rotation.x = 0;
      } else if (status === 'completed') {
        // Open lid to reveal gold core
        parcelGroup.position.y = 0.1 + Math.sin(elapsedTime * 1.2) * 0.05;
        if (lidGroup) {
          lidGroup.rotation.x = THREE.MathUtils.lerp(lidGroup.rotation.x, -Math.PI / 2.2, 0.06);
        }
        if (giftCore) {
          giftCore.rotation.y = elapsedTime * 1.2;
          giftCore.rotation.x = elapsedTime * 0.8;
          giftCore.position.y = 0.95 + Math.sin(elapsedTime * 2) * 0.08;
        }
      } else if (status === 'cancelled') {
        parcelGroup.position.y = 0;
        if (lidGroup) lidGroup.rotation.x = 0;
      }

      // Rotate particle dust
      particleSystem.rotation.y = elapsedTime * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [status]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '280px',
        position: 'relative',
        cursor: 'grab',
      }}
    />
  );
}
