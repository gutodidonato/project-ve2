import { useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const Model = () => {
  const { scene } = useGLTF('/models/delorean_dmc12__retro_wave_art.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.emissiveIntensity = 1.5;
        child.material.toneMapped = false; 
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={1.0} />;
};

export const Experience = () => {
  const meshRef = useRef();
  const lightRef = useRef();
  const scroll = useScroll();
  const [animated, setAnimated] = useState(false);

  useFrame((state, delta) => {
    const y = scroll.offset; 

    if (meshRef.current && !animated) {
      meshRef.current.rotation.y += delta * 0;
    }


    state.camera.position.set(2, 4 - y * 10, 10);
    state.camera.lookAt(0, 0, 0);


    if (y > 0.4 && !animated) {
      setAnimated(true); 

      gsap.to(meshRef.current.position, {
        x: 1,
        duration: 1.5,
        ease: 'power2.out',
      });

      // Anima a luz
      gsap.to(lightRef.current.position, {
        x: -2,
        y: 8,
        duration: 1.2,
        ease: 'power2.out',
      });

      // Opcional: mudar cor ou intensidade da luz
      gsap.to(lightRef.current, {
        intensity: 2,
        duration: 1.5,
        ease: 'power2.out',
      });
    }

    // Se quiser resetar quando voltar:
    if (y < 0.45 && animated) {
      setAnimated(false);

      gsap.to(meshRef.current.position, { x: 0, duration: 1 });
      gsap.to(lightRef.current.position, { x: 3, y: 5, duration: 1 });
      gsap.to(lightRef.current, { intensity: 1, duration: 1 });
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight
        ref={lightRef}
        position={[0, 10, 1]}
        intensity={1}
        castShadow
      />
      <group ref={meshRef} position={[0, -1.5, 0]}>
        <Model />
      </group>
    </>
  );
};
