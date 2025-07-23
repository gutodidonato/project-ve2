import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import CardCarrossel from "../ui/CardCarrossel";
import GridUi from "../ui/GridUi";
import SideCard from "../ui/SideCard"


export default function Fixed({ section, conteudo, setConteudo }) {
  const fixedPos = useRef(null);

  const botItem1 = useRef(null);
  const botItem2 = useRef(null);
  const botItem3 = useRef(null);
  const botItem4 = useRef(null);
  
  const centralContent = useRef(null);
  const gridLayout = useRef(null);

  const carrosselCard = useRef(null);
  const [carrosselState, setCarrosselState] = useState(true);
  const [separar, setSeparar] = useState(true)
  const [text, setText] = useState("");

  let first_animate = (section >= 5 && section < 8);
  let second_animate = (section >= 8 && section<= 11);
  let third_animate = (section > 11 && section < 14);
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
        duration: 0.5,
        ease: "power2.out",
        pointerEvents: "none", 
      });

      gsap.to(botItem2.current, {
        opacity: 0,
        duration: 0.3,
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
      
      gsap.to(botItem1.current, {
        opacity: 0,
        duration: 1,
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

      gsap.to(centralContent.current, {
        opacity: 0,
        zIndex: 10,
        duration: 0.5,
        overwrite: "auto"
      })
      gsap.to(centralContent.current, {
        opacity: 0,
        duration: 2,
        delay: 2,
        zIndex: 10,
        pointerEvents: "none",
        ease: "power1.in",
        overwrite: "auto",
      });
      
    }
    else if (fourth_animate){
      
      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
      
      gsap.to(botItem1.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
      
      gsap.to(botItem3.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
    
      gsap.to(botItem4.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power1.in",
        overwrite: "auto"
      })

  
      gsap.to(centralContent.current, {
        opacity: 1,
        duration: 2,
        delay: 3,
        ease: "power1.in",
        overwrite: "auto"
      })
      gsap.to(centralContent.current, {
        duration: 2,
        zIndex: 40,
        delay:3,
        ease: "power1.in",
        pointerEvents: "auto",
        overwrite: "auto"
      })

    }
    else{
      gsap.to(centralContent.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in",
        pointerEvents: "none",
        overwrite: "auto"
      })

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

    if (section < 8) {
      
    gsap.to(botItem1.current, {
      opacity: progress,
      y: 400 * (1 - progress),
      duration: 0.5,
      ease: "power3.out",
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


  useEffect(()=>{
    if (conteudo == 0){
      setText("lallaal");
      gsap.fromTo(botItem4.current, {
        opacity: 0,
        duration: 0.5,
      },
      {
        opacity: 1,
        duration: 0.5
      })
    }
    else if (conteudo == 1){
      setText("feijão");
      gsap.fromTo(botItem4.current, {
        opacity: 0,
        duration: 0.5,
      },
      {
        text: "lallaal",
        opacity: 1,
        duration: 0.5
      })
    }
    else if (conteudo == 2){
      setText("pamonha");
      gsap.fromTo(botItem4.current, {
        opacity: 0,
        duration: 0.5,
      },
      {
        opacity: 1,
        duration: 0.5
      })
    }
    else{
      setText("requeijao");
      gsap.fromTo(botItem4.current, {
        opacity: 0,
        duration: 0.5,
      },
      {
        opacity: 1,
        duration: 0.5
      })
    }
  }, [conteudo])

  return (
    <div className="fixed w-screen h-screen top-0 z-20 pointer-events-none">

      {/* Etapa Front */}

      <div  ref={fixedPos}
            style={{ opacity: 0 }} 
            className="h-2/8 w-1/3 mx-auto mt-10 flex justify-center items-center">
        <p className="text-white shadow-black text-shadow-lg/30 text-4xl font-bold text-center">Desenvolvimento Mobile/ Frontend </p>
      </div>

      <div className="h-1/5 w-3/5 fixed left-1/5 right-1/5 bottom-10 flex justify-center items-center">
        <div className="w-3/4">
          <p ref={botItem1} 
          style={{ opacity: 0}} 
          className="text-white text-shadow-lg/30 shadow-black text-2xl text-center font-semibold font-open-sans">
      Desenvolvo soluções digitais com foco em performance e experiência. Atuei nos projetos de streaming do Hospital Sírio-Libanês e da rede Posadas no México, com forte presença no mobile e frontend.
          </p>
        </div>
      </div>

      {/* Etapa stacks */}
      <div ref={carrosselCard} 
           style={{opacity : 0}}
           className="w-full overflow-hidden">
          <CardCarrossel state={carrosselState} />
      </div>


      <div className="h-1/5 w-3/5 fixed left-1/5 right-1/5 bottom-10 flex justify-center items-center">
        <div className="w-3/4">
          <p ref={botItem2} 
          style={{ opacity: 0}} className="text-white text-shadow-lg/30 shadow-black text-2xl text-center font-semibold font-open-sans">
          Tenho domínio total sobre diferentes stacks e linguagens — programo com fluidez em qualquer tecnologia, ajustando à necessidade do projeto. Além do desenvolvimento full stack, também atuo com IA, aplicando modelos e integrações inteligentes em aplicações reais.
          </p>
        </div>
      </div>


      {/* Etapa Grid */}

      <div ref={gridLayout} 
        style={{opacity: 0}}
        className="h-full w-full z-25 absolute top-0 overflow-visible">
        <GridUi separar={separar}/>
      </div>


      <div ref={botItem3} 
          style={{opacity : 0}}
          className="absolute z-30 bottom-0 h-2/5 w-full flex items-center justify-center">
        <p className="text-amber-50 bg-[#222222f5] rounded-2xl 
          p-5 font-semibold text-xl">Muitos sites e soluções desenvolvidas para empresas, do back ao front, da ia ao BI,
          sempre presando a solução
        </p>
      </div>



      {/* Etapa fim */}
      <div ref={centralContent} 
          style={{opacity : 0, pointerEvents: "none", zIndex: 10}}
          className="absolute w-full 
          flex items-center justify-center z-20 flex-col gap-15">
        <div>
            <SideCard conteudo={conteudo} setConteudo={setConteudo} animation_status={fourth_animate}/>
        </div>
        <p ref={botItem4} 
          style={{opacity : 0}} 
          className="text-amber-50 
          p-5 font-semibold text-xl">{text}
        </p>
      </div>

    </div>
  );
}
