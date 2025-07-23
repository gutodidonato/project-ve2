import { useEffect, useRef, useState } from 'react';
import './style.css';
import { gsap } from "gsap";


export default function SideCard({ conteudo, setConteudo }) {
  const boxRef = useRef(null);
  const [inView, setInView] = useState(false);

  
  return (
    <div onMouseLeave={() => setConteudo(-1)} className="sideCard">
      <div className='box_card' onMouseEnter={() => setConteudo(0)}>
        <div
          ref={boxRef}
          className='bg-black w-full h-200 flex items-center justify-center z-100 caixa-escura-sombria'
        >
        </div>
          <span></span>
      </div>
      <div className='box_card' onMouseEnter={() => setConteudo(1)}>
        <div
        className='bg-black w-full h-200 flex items-center justify-center z-100 caixa-escura-sombria'>
        </div>
          <span></span>
      </div>
      <div className='box_card' onMouseEnter={() => setConteudo(2)}>
        <div 
         className='bg-black w-full h-200 flex items-center justify-center z-100 caixa-escura-sombria'>
        </div>
          <span></span>
      </div>
    </div>
  );
}
