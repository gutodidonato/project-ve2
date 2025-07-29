import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

export default function LastCardComponent({index, setIndex, natural_index}) {

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
        className="w-60 h-60 bg-white rounded-2xl flex items-center justify-center
        relative overflow-hidden cursor-pointer">
            <div className='w-full h-full bg-[#000000]'>
              <video autoPlay controls src="/video/sample1.mp4"></video>
            </div>
            <img 
              ref={imagem_up}
              style={{ filter: 'grayscale(1) brightness(0.1)' }}
              className="absolute w-full h-full" 
              src="/imgs/eu.jpg" 
              alt="" />
            
    </div>
  )
}
