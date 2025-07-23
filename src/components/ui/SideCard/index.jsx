import { useEffect, useRef, useState } from 'react';
import './style.css';
import { gsap } from "gsap";


export default function SideCard({ conteudo, setConteudo, animation_status }) {
  const boxRef1 = useRef(null);
  const boxRef2 = useRef(null);
  const boxRef3 = useRef(null);

  useEffect(() => {
    console.log("Animation status:", animation_status);
    if (!animation_status) {
      [boxRef1, boxRef2, boxRef3].forEach(ref => {
        if (ref.current) {
          gsap.to(ref.current, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
        }
      });
    } else {
      gsap.to(boxRef1.current, {
        opacity: 0.9,
        y: -800,
        ease: "power2.out",
        delay: 10,
        duration: 5,
      });
      gsap.to(boxRef2.current, {
        opacity: 0.9,
        y: -800,
        ease: "power2.out",
        delay: 10,
        duration: 6,
      });
      gsap.to(boxRef3.current, {
        opacity: 0.9,
        y: -800,
        ease: "power2.out",
        delay: 10,
        duration: 4,
      });
    }
  }, [animation_status]);

  return (
    <div onMouseLeave={() => setConteudo(-1)} className="sideCard">
      <div className='box_card overflow-hidden' onMouseEnter={() => setConteudo(0)}>
        <div
          ref={boxRef1}
          className='bg-black w-full h-200 flex items-center justify-center z-100 absolute'
        />
        <span></span>
      </div>
      <div className='box_card' onMouseEnter={() => setConteudo(1)}>
        <div
          ref={boxRef2}
          className='bg-black w-full h-200 flex items-center justify-center z-100 caixa-escura-sombria'
        />
        <span></span>
      </div>
      <div className='box_card' onMouseEnter={() => setConteudo(2)}>
        <div
          ref={boxRef3}
          className='bg-black w-full h-200 flex items-center justify-center z-100 caixa-escura-sombria'
        />
        <span></span>
      </div>
    </div>
  );
}
