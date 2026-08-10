import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { useTexture, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const lerp = THREE.MathUtils.lerp;

type BookProps = ThreeElements['group'] & {
  frontImg: string;
  backImg: string;
  spineImg: string;
};

function Book({ frontImg, backImg, spineImg, ...props }: BookProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [frontTexture, backTexture, spineTexture] = useTexture([
    frontImg,
    backImg,
    spineImg,
  ]);

  // Rotate book based on mouse pointer position with a stronger idle motion so it feels alive immediately
  useFrame((state, delta) => {
    if (groupRef.current) {
      const pointer = state.pointer;
      const alpha = 1 - Math.exp(-delta * 5);
      const idleX = Math.sin(state.clock.elapsedTime * 0.85) * 0.13;
      const idleY = Math.sin(state.clock.elapsedTime * 1.05) * 0.34;

      // Clamp the vertical rotation (X-axis) to prevent flipping while keeping the look intact
      const targetX = THREE.MathUtils.clamp(-pointer.y * 0.35 + idleX, -0.28, 0.28);
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, targetX, alpha);

      // Keep the horizontal movement subtle so the book stays comfortably within view
      const targetY = THREE.MathUtils.clamp(pointer.x * 0.8 + idleY, -0.8, 0.8);
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetY, alpha);
    }
  });

  // A single box geometry for the entire book
  const bookWidth = 1.7;
  const bookHeight = bookWidth * 1.414; // A-series paper aspect ratio
  const bookDepth = 0.15; // The thickness of the book

  return (
    <group ref={groupRef} {...props} rotation={[0, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
        {/* Assign materials to each face of the box: [right, left, top, bottom, front, back] */}
        <meshStandardMaterial attach="material-0" color="#f0f0f0" roughness={0.8} /> {/* right side pages */}
        <meshStandardMaterial attach="material-1" map={spineTexture} roughness={0.3} /> {/* left side spine */}
        <meshStandardMaterial attach="material-2" color="#f0f0f0" roughness={0.8} /> {/* top pages */}
        <meshStandardMaterial attach="material-3" color="#f0f0f0" roughness={0.8} /> {/* bottom pages */}
        <meshStandardMaterial attach="material-4" map={frontTexture} roughness={0.3} />
        <meshStandardMaterial attach="material-5" map={backTexture} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function BookScene(props: Omit<BookProps, 'children' | 'ref'>) {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

  return (
    <Canvas
      frameloop="always"
      dpr={dpr}
      camera={{ position: [0, 0, 6.5], fov: 35 }}
      gl={{ antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false }}
      style={{
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        transition: 'filter 0.3s ease, transform 0.3s ease',
      }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} color="#e0e0ff" />
      <Suspense fallback={null}>
        <Book {...props} />
        <ContactShadows
          position={[0, -1.3, 0]}
          opacity={0.35}
          scale={10}
          blur={2.5}
          far={2}
          resolution={128}
          color="#ffffff"
        />
      </Suspense>
    </Canvas>
  );
}