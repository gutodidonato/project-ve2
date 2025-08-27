import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

export const ProjectsModel = ({ opacity, section, active= false }) => {
  const meshRef = useRef();
  const videoRef = useRef(null);
  const scroll = useScroll();
  const [videoTexture, setVideoTexture] = useState(null);

  const video_1 = '/video/mobile.mp4';
  const video_2 = '/video/fullstack.mp4';
  
  let video_stage_1 = section <= 6.5
  let video_stage_2 = section < 13

  const edgeGeometry = useMemo(() => new THREE.PlaneGeometry(4, 2.25), []);

  useEffect(() => {
    const video = document.createElement('video');

    if (video_stage_1){
      video.src = video_1;
    }
    else if(video_stage_2){
      video.src =video_2;
    }
    else{
      video.src = video_1;
    }

    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.addEventListener('loadeddata', () => {
      video.pause();
      video.currentTime = 0;
      video.play();
      const texture = new THREE.VideoTexture(video);
      setVideoTexture(texture);
    });

    videoRef.current = video;

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [video_stage_1, video_stage_2]);

  useFrame(() => {
    if (!meshRef.current) return;

    if (active){

      const scrollY = scroll?.offset ?? 0;
      const targetScale = scrollY < 0.35 ? (scrollY - 0.25) * 5 : 0.5;
      
      meshRef.current.scale.setScalar(targetScale);
      meshRef.current.rotation.y = Math.min(scrollY * 15, Math.PI * 1.83);
      meshRef.current.rotation.x = Math.min(scrollY * 15, Math.PI * 1.69);
      meshRef.current.rotation.z = Math.min(scrollY * 15, Math.PI * 1.8);
    }
    else{
      meshRef.current.scale.setScalar(0.5);
      meshRef.current.rotation.y = Math.PI * 1.83
      meshRef.current.rotation.x = Math.PI * 1.69
      meshRef.current.rotation.z = Math.PI * 1.8
    }
      
    });
    
  if (!videoTexture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 2.25]} />
      <meshBasicMaterial
        map={videoTexture}
        transparent={(opacity > 0.5)? false : true}
        toneMapped={false}
        opacity={opacity}
      />
        {opacity > 0.5 && (
          <lineSegments>
            <edgesGeometry args={[edgeGeometry]} />
            <lineBasicMaterial color="#a8a8a8" />
          </lineSegments>
        )}
    </mesh>
  );
};

export default ProjectsModel;
