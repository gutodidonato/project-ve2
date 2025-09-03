import { useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import {Car} from "../model/Car";
import {ProjectsModel} from "../model/ProjectsModel";
import cameraStages from './cameraStage';

export const Experience = ({ section, index, setIndex }) => {
  const meshRef = useRef();
  const lightRef = useRef();
  const scroll = useScroll();

  let isMobile = window.innerWidth < 1200;

  const fadePlaneRef = useRef();
  const projectsModelRef = useRef();

  const [modelActions, setModelActions] = useState([true, true, true, true, true])

  let correctModelAction = (index)=>{
    modelActions.map((_, idx)=> idx === index? setModelActions[idx] = false : setModelActions[idx] = true )
  }



  const [modelOpacity, setModelOpacity] = useState(1);
  const [screenOpacity, setScreenOpacity] = useState(0);

  let scale = window.innerWidth < 1200 ? 0.5 : 1;
  const lastTargetRef = useRef(new THREE.Vector3());
  

  
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
        isMobile? fadePlaneRef.current.material.opacity = THREE.MathUtils.clamp((y - 0.2) / 0.1, 0, 1) : fadePlaneRef.current.material.opacity = THREE.MathUtils.clamp((y - 0.5) / 0.1, 0, 1)
      } if (y >= 1/4) {
        fadePlaneRef.current.material.opacity = 0
      }
    }


  

      const cameraDirection = new THREE.Vector3();
      state.camera.getWorldDirection(cameraDirection);

      const targetPosition = new THREE.Vector3();

      if (section < 3.7 && modelActions[0]) {

        targetPosition.set(50, -50, -50);
        correctModelAction(0)

      } else if (section >= 3.7 && section <= 11 && modelActions[1]) {

        targetPosition.copy(state.camera.position).add(cameraDirection.multiplyScalar(isMobile? 8 : 6));
        correctModelAction(1)

      } else if (section >= 11 && section < 13 && modelActions[2]) {
        
        targetPosition.copy(state.camera.position).add(cameraDirection.multiplyScalar(isMobile? 12 : 10));
        correctModelAction(2)
      
      }
      else if (section >= 13 && modelActions[3]){

        targetPosition.copy(state.camera.position).add(cameraDirection.multiplyScalar(isMobile? 4 : 10));
        correctModelAction(3)

      }
      else {
      
        targetPosition.copy(state.camera.position); 
        correctModelAction(4)
      }

      const distance = lastTargetRef.current.distanceTo(targetPosition);
      if (distance > 0.1) {
      
        lastTargetRef.current.copy(targetPosition);

        gsap.to(projectsModelRef.current.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 4,
          ease: "power3.out",
          overwrite: "auto"
        });
      }

      if (section >= 14) {
        setScreenOpacity(0);
      } else {
        setScreenOpacity(1);
      }
    });


    return (
      <>
      <ambientLight intensity={1} />
      <directionalLight ref={lightRef} position={[15, 1, 0]} intensity={2} castShadow />
      <mesh ref={fadePlaneRef} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="black" transparent opacity={0} />
      </mesh>
      <group ref={meshRef} position={[0, -1.5, 0]} >
        <Car scale={scale} opacity={modelOpacity} />
      </group>
      {section <= 14 &&
      <group ref={projectsModelRef}>
        <ProjectsModel 
          active={section<7}
          opacity={screenOpacity} 
          section={section} 
          index={index} 
          setIndex={setIndex} />
      </group>
      }
    </>
  );
  }
export default Experience;