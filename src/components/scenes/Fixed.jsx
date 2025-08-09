import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import CardCarrossel from "../ui/CardCarrossel";
import GridUi from "../ui/GridUi";
import LastCard from "../ui/LastCard/Index";


export default function Fixed({ section, conteudo, setConteudo }) {
  const fixedPos = useRef(null);

  const botItem1 = useRef(null);
  const botItem2 = useRef(null);
  const botItem3 = useRef(null);

  const gridLayout = useRef(null);

  const carrosselCard = useRef(null);
  const [carrosselState, setCarrosselState] = useState(true);
  const [separar, setSeparar] = useState(true)

  let first_animate = (section >= 5 && section < 7);
  let second_animate = (section >= 7 && section<= 9);
  let third_animate = (section > 9 && section < 14);
  let fourth_animate = (section >= 14 )
  

  useEffect(() => {
    console.log(section)

    if (first_animate) {
      setCarrosselState(false)

      gsap.set(gridLayout.current, {
        x: '300vw', 
        opacity: 1
      });

      gsap.to(fixedPos.current, {
        opacity: 1,
        duration: 1.0,
        ease: "power2.out",
        pointerEvents: "none", 
      });

      gsap.to(botItem2.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        pointerEvents: "none",
      });

      gsap.to(botItem3.current, {
        opacity: 0,
        ease: "power1.Out"
      } )

      gsap.to(carrosselCard.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in"
      })


    } else if(second_animate)  {

      setCarrosselState(true)


      gsap.to(carrosselCard.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power1.in",
        overwrite: "auto"
      })
      
      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
    

      gsap.to(botItem2.current, {
        opacity: 1,
        duration: 0.3,
        delay: 1,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });

      gsap.to(gridLayout.current, {
        opacity: 1, 
        ease: "power1.inOut",
      });
      
      
      gsap.to(gridLayout.current, {
        x: '300vw',  
        ease: "power1.inOut",
        overwrite: "auto",
        duration: 3,
      });

      gsap.to(botItem3.current, {
        opacity: 0,
        duration: 1,
        ease: "power1.Out",
        overwrite: "auto"
      } )
    }
    
    
    else if (third_animate)  {

    setCarrosselState(false)

      gsap.to(carrosselCard.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in",
        overwrite: "auto"
      })

      gsap.to(gridLayout.current, {
        opacity: 1,
        duration: 0.5, 
        ease: "power1.out",
        overwrite: "auto"
      });

      gsap.to(gridLayout.current, {
        x: 0, 
        duration: 5,
        ease: "power1.inOut",
        overwrite: "auto"
      });

      
      gsap.to(botItem2.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        overwrite: "auto",
        pointerEvents: "none",
      });

      gsap.to(botItem3.current, {
        opacity: 1,
        duration: 3,
        ease: "power1.in",
        overwrite: "auto"
      } )

      
    }
    else if (fourth_animate){
      
      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });

      gsap.to(botItem2.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        overwrite: "auto",
        pointerEvents: "none",
      });
      
      
      gsap.to(botItem3.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
  

    }
    else{

      gsap.to(botItem2.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        overwrite: "auto",
        pointerEvents: "none",
      });

      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5, ease: "power1.out", overwrite: "auto"
      })
      


    }
    
  }, [first_animate, second_animate, third_animate, fourth_animate]);
  
  /*
  ==============
  Scroll Effects
  ==============
  */

  useEffect(() => {
    const progress = Math.min(Math.max((section - 3.5) / 1.5, 0), 1); 

    if (section < 7) {
      
    gsap.to(botItem1.current, {
      opacity: progress,
      y: 400 * (1 - progress),
      duration: 1.0,
      ease: "power3.out",
      overwrite: "auto",
    });
    }
    else {
    gsap.to(botItem1.current, {
      opacity: 0,
      y: 400,
      duration: 0.3,
      ease: "power2.in",
      overwrite: "auto",
    });
  }

    if (section < 14 && !separar){
      setSeparar(true)
    }

    else if (section > 14 && separar){
      setSeparar(false)
    }
    
  }, [section]);

  return (
    <div className="fixed w-screen h-screen top-0 z-20 pointer-events-none">
      {/* Título Responsivo */}
      <div
        ref={fixedPos}
        style={{ opacity: 0 }}
        className="h-2/8 w-full max-w-lg mx-auto mt-6 flex justify-center items-center px-4"
      >
        <p className="text-white shadow-black text-shadow-lg/30 text-center font-bold text-xl md:text-4xl">
          Desenvolvimento Mobile e Frontend
        </p>
      </div>

      {/* Primeira descrição responsiva */}
      <div className="w-full fixed left-1/2 bottom-6 md:bottom-10 flex justify-center items-center transform -translate-x-1/2 px-4">
        <div className="w-full max-w-2xl">
          <p
            ref={botItem1}
            style={{ opacity: 0 }}
            className="text-white text-shadow-lg/30 shadow-black text-center font-semibold font-open-sans text-sm md:text-2xl"
          >
            Desenvolvo soluções digitais com foco em performance e experiência. Atuei nos projetos de streaming do Hospital Sírio-Libanês e da rede Posadas no México, com forte presença no mobile e frontend.
          </p>
        </div>
      </div>

      {/* Carrossel responsivo */}
      <div
        ref={carrosselCard}
        style={{ opacity: 0 }}
        className="w-full flex justify-center items-center overflow-hidden px-2"
      >
        <CardCarrossel state={carrosselState} />
      </div>

      {/* Segunda descrição responsiva */}
      <div className="w-full max-w-2xl fixed left-1/2 md:bottom-10 bottom-20 flex justify-center items-center transform -translate-x-1/2 px-4">
        <div className="w-full flex justify-center items-center">
          <p
            ref={botItem2}
            style={{ opacity: 0 }}
            className="text-white text-shadow-lg/30 shadow-black text-center font-semibold font-open-sans text-xs md:text-2xl"
          >
            Tenho domínio total sobre diferentes stacks e linguagens — programo com fluidez em qualquer tecnologia, ajustando à necessidade do projeto. Além do desenvolvimento full stack, também atuo com IA, aplicando modelos e integrações inteligentes em aplicações reais.
          </p>
        </div>
      </div>

      {/* Grid responsivo */}
      <div
        ref={gridLayout}
        style={{ opacity: 0 }}
        className="h-full w-full z-25 absolute top-0 overflow-visible"
      >
        <GridUi separar={separar} />
      </div>

      {/* Terceira descrição responsiva */}
      <div
        ref={botItem3}
        style={{ opacity: 0 }}
        className="absolute z-30 bottom-0 h-auto min-h-[120px] w-full flex items-center justify-center px-2 pb-4"
      >
        <p className="text-amber-50 bg-[#222222f5] rounded-2xl p-3 md:p-5 font-semibold text-base md:text-xl text-center">
          Muitos sites e soluções desenvolvidas para empresas, do back ao front, da ia ao BI,
          sempre presando a solução
        </p>
      </div>

      {/* Etapa fim responsiva */}
      <div className="absolute top-0 w-full h-full flex items-center justify-around flex-col">
        <LastCard animate_state={fourth_animate} />
      </div>
    </div>
  );
}
