import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

export default function LastCardComponent({index, setIndex, natural_index, style,setChosenIndex, image_src, video_src = "/video/sample1.mp4"}) {

  const imagem_up = useRef(null);
  const comp_card = useRef(null);
  const [isUp, setIsUp] = useState(true);

  let isTheChosen = (natural_index ) === index;


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
        width: 200,
        duration: 1,
        ease: "power2.out",
      });
    } else {
      gsap.to(comp_card.current, {
        width: 200,
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
            setIsUp(false)
          }
        }}
        className={`bg-white rounded-2xl flex items-center justify-center
        relative overflow-hidden cursor-pointer opacity-80`}
        ref={comp_card}
        style={{width: 200, height: 200}}>
            <div className='w-full h-full bg-[#000000]'>
              {isTheChosen && (
                <video 
                  autoPlay 
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  src={video_src}
                />
              )}
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
