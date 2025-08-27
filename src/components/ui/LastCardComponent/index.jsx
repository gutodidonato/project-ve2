import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

export default function LastCardComponent({index, size, setIndex, natural_index, style,setChosenIndex,
   image_src,
   video_src = "/video/sample1.mp4"}) {

  const imagem_up = useRef(null);
  const comp_card = useRef(null);
  const [isUp, setIsUp] = useState(true);

  let isTheChosen = (natural_index ) === index;

  useEffect(() => {
    if (index == 1){
      gsap.to(imagem_up.current, {
        background: "rgb(64 15 95)",
        duration: 3,
        ease: "power2.out",
        overwrite: true,
    })}
    if (index == 2){
      gsap.to(imagem_up.current, {
        background: "rgb(123 1 10)",
        duration: 3,
        ease: "power2.out",
        overwrite: true,
    })}
    if (index == 0){
      gsap.to(imagem_up.current, {
        background: "rgb(20 18 110)",
        duration: 3,
        ease: "power2.out",
        overwrite: true,
    })}
      
    
  }, [index]);


  useEffect(() => {
    if (index === natural_index && isUp === true) {
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
  }, [index, isUp]);

    useEffect(() => {
    if (isTheChosen) {
      gsap.to(comp_card.current, {
        width: window.innerWidth < 1200? 230: 295,
        height: window.innerWidth < 1200? 230: 295,
        duration: 1,
        ease: "power2.out",
      });
    } else {
      gsap.to(comp_card.current, {
        width: window.innerWidth < 1200? 100: 140,
        height: window.innerWidth < 1200? 100: 140,
        duration: 1,
        ease: "power2.inOut",
      });
    }
  }, [isTheChosen]);




  return (
    <div 
        onClick={() => {
          if (index != natural_index) {
            setIsUp(true)
            setIndex(natural_index);
            setChosenIndex(natural_index);
          } else {
            setIsUp(!isUp)
          }
        }}
        className='{bg-white rounded-2xl flex items-center justify-center
        relative overflow-hidden cursor-pointer}'
        ref={comp_card}
        style={{
                width: size,
                height: size,
              }}>
            <div className='w-full h-full bg-[#000000]'>
              {isTheChosen && (
                <video 
                  autoPlay 
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'fill' }}
                  src={video_src}
                />
              )}
            </div>
            <div 
              ref={imagem_up}
              style={{ filter: 'grayscale(0.3) brightness(0.5)', opacity: 1, background: 'red' }}
              className="absolute w-full h-full flex items-center justify-center" 
              src={image_src} 
              alt="" >
              <img 
                src={image_src} 
                style={{ width: '80%', height: '80%'}}
                alt="" 
                className="w-full h-full object-cover"
                />
              </div>
            
    </div>
  )
}