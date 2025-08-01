import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

export default function LastCardComponent({index, setIndex, natural_index, image_src, video_src = "/video/sample1.mp4"}) {

  const imagem_up = useRef(null);
  const [isUp, setIsUp] = useState(false);


  useEffect(() => {
    if (index === natural_index) {
      gsap.to(imagem_up.current, {
        y: -300,
        duration: 1,
        ease: "power2.out",
      });
    } else {
      gsap.to(imagem_up.current, {
        y: 0,
        duration: 1,
        ease: "power2.inOut",
      });
    }
  }, [index]);



  return (
    <div 
        onClick={() => index != natural_index? setIndex(natural_index) : setIndex(0)}
        className="w-70 h-70 bg-white rounded-2xl flex items-center justify-center
        relative overflow-hidden cursor-pointer opacity-80">
            <div className='w-full h-full bg-[#000000]'>
              <video 
              on
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay 
              src={video_src}></video>
            </div>
            <img 
              ref={imagem_up}
              style={{ filter: 'grayscale(0.3) brightness(0.5)', opacity: 1 }}
              className="absolute w-full h-full" 
              src={image_src} 
              alt="" />
            
    </div>
  )
}
