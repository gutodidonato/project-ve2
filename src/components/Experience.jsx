import { useGLTF, useScroll } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Wall } from "./Wall";

const Model = (props) => {
  const { scene } = useGLTF('/models/delorean_dmc12__retro_wave_art.glb');

useEffect(() => {
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.emissiveIntensity = 1.5;
      child.material.toneMapped = false;
      child.material.transparent = true;
      child.material.opacity = props.opacity !== undefined ? props.opacity : 1;
    }
  });
}, [scene, props.opacity]);

  return <primitive object={scene} props scale={1.0} />;
};
export const Experience = () => {
  const meshRef = useRef();
  const lightRef = useRef();
  const scroll = useScroll();
  const fadePlaneRef = useRef();
  const [modelOpacity, setModelOpacity] = useState(1);
  const [wallOpacity, setWallOpacity] = useState(0);


  const cameraStages = [
    {
      start: 0.0,
      end: 0.125,
      from: new THREE.Vector3(10, -0.78, -7),
      to: new THREE.Vector3(15.66, -0.83, -6.31),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(1, 0, 0),
    },
    {
      start: 0.125,
      end: 0.25,
      from: new THREE.Vector3(15.66, -0.83, -6.31),
      to: new THREE.Vector3(0.62, 3, 15.58),
      lookFrom: new THREE.Vector3(1, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      start: 0.25,
      end: 0.375,
      from: new THREE.Vector3(0.62, 3, 15.58),
      to: new THREE.Vector3(-7.41, -1, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 1, 0),
    },
    {
      start: 0.375,
      end: 0.5,
      from: new THREE.Vector3(-7.41, -1, 10),
      to: new THREE.Vector3(-30, 3, -7),
      lookFrom: new THREE.Vector3(0, 1, 0),
      lookTo: new THREE.Vector3(10, 3, 3),
    },

  ];

  useFrame((state) => {
    const y = scroll.offset;
    console.log(`Scroll atual: ${scroll.offset}`)

    const targetUseModel = y <= 0.5;

    setModelOpacity(prev => THREE.MathUtils.lerp(prev, targetUseModel ? 1 : 0, 0.1));
    setWallOpacity(prev => THREE.MathUtils.lerp(prev, targetUseModel ? 0 : 1, 0.1));

    for (const stage of cameraStages) {
      if (y >= stage.start && y <= stage.end) {
        const t = (y - stage.start) / (stage.end - stage.start);

        const newPosition = new THREE.Vector3().lerpVectors(stage.from, stage.to, t);
        const newLookAt = new THREE.Vector3().lerpVectors(stage.lookFrom, stage.lookTo, t);

        state.camera.position.copy(newPosition);
        state.camera.lookAt(newLookAt);
        break;
      }
    }

    if (y < 0.125)
      gsap.to(lightRef.current.position, { x: 15, y: 0, z: 0, duration: 1.2, ease: 'power2.out' });
      gsap.to(lightRef.current, { intensity: 2, duration: 1.2 });

    if (y > 0.125 && y < 0.25) {
      gsap.to(lightRef.current.position, { x: 15, y: 30, z: 3, duration: 5 });
      gsap.to(lightRef.current, { intensity: 1.2, duration: 1.2 });
    }
    if (y > 0.25) {
      gsap.to(lightRef.current.position,{ x: -5, y: 8, z: 3, duration: 5 });
      gsap.to(lightRef.current, { intensity: 2, duration: 1.2 });
    }

   if (y > 0.6) {

      state.camera.position.set(0, 0.5, 0);
      state.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    
    
    if (fadePlaneRef.current) {
      const camera = state.camera;
      fadePlaneRef.current.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1));
      fadePlaneRef.current.quaternion.copy(camera.quaternion);
      if (y < 0.5){
        fadePlaneRef.current.material.opacity = THREE.MathUtils.clamp((y - 0.35) / 0.1, 0, 1);
      } if (y >= 0.6) {
        fadePlaneRef.current.material.opacity = THREE.MathUtils.clamp(1 - (y - 0.5) / 0.2, 0, 1);
      }
    }
  
      

  })


    return (
      <>
      <ambientLight intensity={1} />
      <directionalLight ref={lightRef} position={[15, 1, 0]} intensity={2} castShadow />
      <mesh ref={fadePlaneRef} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="black" transparent opacity={0} />
      </mesh>
      <group ref={meshRef} position={[0, -1.5, 0]}>
        <Model opacity={modelOpacity} />
      </group>
      <group>
        <Wall opacity={wallOpacity} />
      </group>
    </>
  );
  }
export default Experience;