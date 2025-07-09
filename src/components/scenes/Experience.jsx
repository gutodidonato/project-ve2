import { useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
<<<<<<< HEAD:src/components/scenes/Experience.jsx
import {Car} from "../model/Car";
import {ProjectsModel} from "../model/ProjectsModel";
=======
import {Car} from "./model/Car";
import {ProjectsModel} from "./model/ProjectsModel";
>>>>>>> 16002350f511a0e827af8108ed68abf181bf0c80:src/components/Experience.jsx

export const Experience = () => {
  const meshRef = useRef();
  const lightRef = useRef();
  const scroll = useScroll();

  const fadePlaneRef = useRef();
  const projectsModelRef = useRef();

  const [modelOpacity, setModelOpacity] = useState(1);
  const [screenOpacity, setScreenOpacity] = useState(0)

  

  const cameraStages = [
    {
      //traseira
      start: 0.0,
      end: (0.20)/4,
      from: new THREE.Vector3(10, -0.78, -7),
      to: new THREE.Vector3(15.66, -0.83, -6.31),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(1, 0, 0),
    },
    {
      //esquerda 
      start: (0.20)/4,
      end: (0.50)/4, 
      from: new THREE.Vector3(15.66, -0.83, -6.31),
      to: new THREE.Vector3(0.62, 1, 15.58),
      lookFrom: new THREE.Vector3(1, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      //frente_1
      start: (0.50)/4,
      end: (0.70)/4,
      from: new THREE.Vector3(0.62, 1, 15.58),
      to: new THREE.Vector3(-7.41, -1, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      //frente_2
      start: (0.70)/4,
      end: (0.80)/4,
      from: new THREE.Vector3(-7.41, -1, 10),
      to: new THREE.Vector3(-7.41, 10, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 1, 0),
    },
    {
      //entrando espelho
      start: (0.80)/4,
      end:(1.00)/4,
      from: new THREE.Vector3(-7.41, 10, 10),
      to: new THREE.Vector3(2, 1, 0),
      lookFrom: new THREE.Vector3(0, 1, 0),
      lookTo: new THREE.Vector3(5, -4, -3),
    },
    {
      start: (1.00)/4,
      end:(3.00)/4,
      from: new THREE.Vector3(2, 1, 0),
      to: new THREE.Vector3(2, 1, 0),
      lookFrom: new THREE.Vector3(5, -4, -3),
      lookTo: new THREE.Vector3(5, -4, -3),
    },

  ];

  useFrame((state) => {
    const y = scroll.offset;

    const targetUseModel = y <= 1/4;

    setModelOpacity(prev => THREE.MathUtils.lerp(prev, targetUseModel ? 1 : 0, 0.1));
    setScreenOpacity(prev => THREE.MathUtils.lerp(prev, targetUseModel ? 0: 1, 0.1));


    for (const stage of cameraStages) {
      if (y >= stage.start && y <= stage.end) {
        const t = (y - stage.start) / (stage.end - stage.start);
        const newPosition = new THREE.Vector3().lerpVectors(stage.from, stage.to, t);
        const newLookAt = new THREE.Vector3().lerpVectors(stage.lookFrom, stage.lookTo, t);
        state.camera.position.copy(newPosition);
        state.camera.lookAt(newLookAt);
        break;
    }}

    if (y < 1/16)
      gsap.to(lightRef.current.position, { x: 15, y: 0, z: 0, duration: 1.2, ease: 'power2.out' });
      gsap.to(lightRef.current, { intensity: 2, duration: 1.2 });

    if (y > 1/16 && y < 1/8) {
      gsap.to(lightRef.current.position, { x: 15, y: 30, z: 3, duration: 5 });
      gsap.to(lightRef.current, { intensity: 1.2, duration: 1.2 });
    }
    if (y > 1/8) {
      gsap.to(lightRef.current.position,{ x: -5, y: 8, z: 3, duration: 5 });
      gsap.to(lightRef.current, { intensity: 2, duration: 1.2 });
    }

    
    
    if (fadePlaneRef.current) {
      const camera = state.camera;
      fadePlaneRef.current.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1));
      fadePlaneRef.current.quaternion.copy(camera.quaternion);
      
      if (y < 1/4){
        fadePlaneRef.current.material.opacity = THREE.MathUtils.clamp((y - 0.5) / 0.1, 0, 1);
      } if (y >= 1/4) {
        fadePlaneRef.current.material.opacity = 0
      }
    }
  
  if (projectsModelRef.current) {
    if (targetUseModel) {
      projectsModelRef.current.position.set(-100, -100, -100);
    } else {
      const cameraDirection = new THREE.Vector3();
      state.camera.getWorldDirection(cameraDirection);
      projectsModelRef.current.position.copy(state.camera.position).add(cameraDirection.multiplyScalar(10));
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
        <Car opacity={modelOpacity} />
      </group>
      <group ref={projectsModelRef}>
        <ProjectsModel opacity={screenOpacity} />
      </group>
    </>
  );
  }
export default Experience;