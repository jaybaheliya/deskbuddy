import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import type { MascotState } from '../types/deskbuddy';

export interface ThreeMascotProps {
  state?: MascotState;
  direction?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  fallback?: React.ReactNode;
}

export const ThreeMascot: React.FC<ThreeMascotProps> = ({
  state = 'idle',
  direction = 'right',
  className = '',
  onClick,
  fallback
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    let animFrameId: number;

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 250;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 3.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // 100% transparent
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(2, 4, 3);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    const clock = new THREE.Clock();
    const loader = new FBXLoader();

    // 3. Load Drinking FBX (contains full 3D character mesh + drinking animation)
    loader.load(
      './mascot/Drinking.fbx',
      (fbx) => {
        if (isDisposed) return;

        modelRef.current = fbx;

        // Auto-scale and center the character
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetHeight = 1.9;
        const scale = targetHeight / (size.y || maxDim || 1);
        fbx.scale.setScalar(scale);

        // Center on floor
        box.setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        fbx.position.x -= center.x;
        fbx.position.y -= box.min.y;
        fbx.position.z -= center.z;

        // Smooth materials and shadows
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        scene.add(fbx);

        // Animation mixer
        const mixer = new THREE.AnimationMixer(fbx);
        mixerRef.current = mixer;

        if (fbx.animations && fbx.animations.length > 0) {
          const drinkClip = fbx.animations[0];
          drinkClip.name = 'drinking';
          const drinkAction = mixer.clipAction(drinkClip);
          actionsRef.current.set('drinking', drinkAction);
          actionsRef.current.set('idle', drinkAction); // also use as idle

          // Start playing
          drinkAction.play();
          currentActionRef.current = drinkAction;
        }

        // 4. Also try loading Walking.fbx animation clip
        loader.load(
          './mascot/Walking.fbx',
          (walkFbx) => {
            if (isDisposed || !walkFbx.animations || walkFbx.animations.length === 0) return;
            const walkClip = walkFbx.animations[0];
            walkClip.name = 'walking';
            const walkAction = mixer.clipAction(walkClip);
            actionsRef.current.set('walking', walkAction);
          },
          undefined,
          () => {
            // Walking clip optional
          }
        );

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.warn('Failed to load 3D FBX model, falling back to vector:', error);
        if (!isDisposed) {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    );

    // Render loop
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle animation switching (e.g. state === 'walking' vs 'drinking')
  useEffect(() => {
    if (!mixerRef.current) return;

    const targetKey = state === 'walking' ? 'walking' : 'drinking';
    const nextAction = actionsRef.current.get(targetKey) || actionsRef.current.get('drinking');

    if (nextAction && nextAction !== currentActionRef.current) {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.3);
      }
      nextAction.reset().fadeIn(0.3).play();
      currentActionRef.current = nextAction;
    }
  }, [state]);

  // Handle character facing direction
  useEffect(() => {
    if (modelRef.current) {
      // Rotate model slightly towards direction
      if (direction === 'left') {
        modelRef.current.rotation.y = -Math.PI / 4;
      } else {
        modelRef.current.rotation.y = Math.PI / 4;
      }
    }
  }, [direction]);

  if (loadError) {
    return <>{fallback}</>;
  }

  return (
    <div
      ref={mountRef}
      className={`three-mascot-container state-${state} dir-${direction} ${className}`}
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            color: '#38bdf8',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>✦ Loading 3D Character...</span>
        </div>
      )}
    </div>
  );
};
