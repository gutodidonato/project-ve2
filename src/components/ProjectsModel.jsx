import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ProjectsModel = (props) => {
  const meshRef = useRef();
  const videoRef = useRef(null); 
  const scroll = useScroll();
  const [videoTexture, setVideoTexture] = useState(null);
  const scaleRef = useRef(1);

  const video_1 = '/video/sample1.mp4';


  useEffect(() => {
    const video = document.createElement('video');
    video.src = video_1;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.addEventListener('loadeddata', () => {
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
  }, []);

    useFrame(() => {
    if (!meshRef.current) return;

    const scrollY = scroll.offset;
    const targetScale = (scrollY < 0.7/2)? ((scrollY - 0.5/2)*5) : 0.5;

    scaleRef.current = targetScale;
     if (meshRef.current) {
        meshRef.current.rotation.y = Math.PI * 1.83;
        meshRef.current.rotation.x =  Math.PI * 1.69;
        meshRef.current.rotation.z =  Math.PI * 1.8;
      }
    meshRef.current.scale.setScalar(scaleRef.current); 
    });

  if (!videoTexture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 2.25]} />
      <meshBasicMaterial map={videoTexture} toneMapped={false} />
      {/* Borda branca */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(4, 2.25)]} />
        <lineBasicMaterial color="white" />
      </lineSegments>
    </mesh>
  );
}

export default ProjectsModel;
