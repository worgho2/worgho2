'use client';

import './globals.css';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useRef, useLayoutEffect, use } from 'react';
import { useTransform, useScroll, useTime } from 'framer-motion';
import { degreesToRadians, progress, mix } from 'popmotion';
import * as THREE from 'three';

const color = '#ffffff';

const Icosahedron = () => (
  <mesh rotation-x={0.35}>
    <icosahedronGeometry args={[1, 1]} />
    <meshBasicMaterial
      wireframe
      color={color}
    />
  </mesh>
);

const Star = ({ p }: { p: number }) => {
  const ref = useRef<THREE.Object3D>(null);
  const { scrollYProgress } = useScroll();
  const distanceMultiplier = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const distance = mix(1.5, 3.5, Math.random());
  const yAngle = mix(degreesToRadians(80), degreesToRadians(100), Math.random());
  const xAngle = degreesToRadians(360) * p;

  useLayoutEffect(() => {
    ref.current!.position.setFromSphericalCoords(distance, yAngle, xAngle);
  });

  useFrame(() => {
    ref.current!.position.setFromSphericalCoords(
      distance * distanceMultiplier.get(),
      yAngle,
      xAngle
    );
  });

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
      <meshBasicMaterial
        wireframe
        color={color}
      />
    </mesh>
  );
};

function Scene({ numStars = 1000 }) {
  // const gl = useThree((state) => state.gl);
  const { scrollYProgress } = useScroll();
  const yAngle = useTransform(scrollYProgress, [0, 1], [0.001, degreesToRadians(180)]);
  const distance = useTransform(scrollYProgress, [0, 1], [10, 3]);
  const time = useTime();

  useFrame(({ camera }) => {
    camera.position.setFromSphericalCoords(distance.get(), yAngle.get(), time.get() * 0.0005);
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });

  // useLayoutEffect(() => gl.setPixelRatio(1));

  const stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push(<Star p={progress(0, numStars, i)} />);
  }

  return (
    <>
      <Icosahedron />
      {stars}
    </>
  );
}

export default function Home() {
  return (
    <div className='container'>
      <Canvas gl={{ antialias: false }}>
        <Scene />
      </Canvas>
    </div>
  );
}
