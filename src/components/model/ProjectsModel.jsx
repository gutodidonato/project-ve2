import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

export const ProjectsModel = ({ opacity }) => {
  const meshRef = useRef();
  const videoRef = useRef(null);
  const scroll = useScroll();
  const [videoTexture, setVideoTexture] = useState(null);

  const video_1 = '/video/sample1.mp4';

  const edgeGeometry = useMemo(() => new THREE.PlaneGeometry(4, 2.25), []);

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
    const targetScale = (scrollY < 0.35) ? ((scrollY - 0.25) * 5) : 0.5;

    meshRef.current.scale.setScalar(targetScale);
    meshRef.current.rotation.y = Math.min(scrollY * 15, Math.PI * 1.83);
    meshRef.current.rotation.x = Math.min(scrollY * 15, Math.PI * 1.69);
    meshRef.current.rotation.z = Math.min(scrollY * 15, Math.PI * 1.8);
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
            <lineBasicMaterial color="#c4c2c2" />
          </lineSegments>
        )}
    </mesh>
  );
};

export default ProjectsModel;
