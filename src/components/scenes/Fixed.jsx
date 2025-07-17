import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import CardCarrossel from "../ui/CardCarrossel";
import GridUi from "../ui/GridUi";


export default function Fixed({ section }) {
  const fixedPos = useRef(null);

  const botItem = useRef(null);
  const botItem2 = useRef(null);
  const botItem3 = useRef(null);

  const gridLayout = useRef(null);

  const carrosselCard = useRef(null);
  const [carrosselState, setCarrosselState] = useState(true);
  
  let first_animate = (section >= 5 && section < 8);
  let second_animate = (section >= 8 && section<= 11);
  let third_animate = (section > 11 && section <= 14);
  let last_animate = (section > 14)

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
      
      gsap.to(botItem.current, {
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
    else if (last_animate){

      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
      
      gsap.to(botItem.current, {
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

      gsap.to(gridLayout.current, {
        opacity: 0, 
        duration: 2,
        ease: "power1.in",
        overwrite: "auto"
      });

    }
    else{
      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5, ease: "power1.out", overwrite: "auto"
      })
    }
    
  }, [first_animate, second_animate, third_animate, last_animate]);

  /*
  ==============
  Scroll Effects
  ==============
  */

  useEffect(() => {
    const progress = Math.min(Math.max((section - 3.5) / 3, 0), 1);

    if (section < 8) {
      
    gsap.to(botItem.current, {
      opacity: progress,
      y: 400 * (1 - progress),
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
    }
    
  }, [section]);

  return (
    <div className="fixed w-screen h-screen top-0 z-20 pointer-events-none">
      {/* Titulo superior Mobile */}
      <div  ref={fixedPos}
            style={{ opacity: 0 }} 
            className="h-2/8 w-1/3 mx-auto mt-10 flex justify-center items-center">
        <p className="text-white shadow-black text-shadow-lg/30 text-4xl font-bold text-center">Desenvolvimento Mobile</p>
      </div>


      <div ref={carrosselCard} 
           style={{opacity : 0}}
           className="w-full overflow-hidden">
          <CardCarrossel state={carrosselState} />
      </div>

      {/* Descrição inferior */}
      <div className="h-1/5 w-3/5 fixed left-1/5 right-1/5 bottom-10 flex justify-center items-center">
        <div className="w-3/4">
          <p ref={botItem} 
          style={{ opacity: 0}} 
          className="text-white text-shadow-lg/30 shadow-black text-2xl text-center font-semibold font-open-sans">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo mollitia cumque architecto aut omnis incidunt ullam. Deleniti consequatur quidem ut modi dolor enim voluptate. Non amet quo voluptatem tenetur modi!
          </p>
        </div>
      </div>

      <div className="h-1/5 w-3/5 fixed left-1/5 right-1/5 bottom-10 flex justify-center items-center">
        <div className="w-3/4">
          <p ref={botItem2} 
          style={{ opacity: 0}} className="text-white text-shadow-lg/30 shadow-black text-2xl text-center font-semibold font-open-sans">
          asd dasdasd as
          </p>
        </div>
      </div>

      <div ref={gridLayout} 
        style={{opacity: 0}}
        className="h-full w-full z-10 absolute top-0 overflow-visible">
        <GridUi section={section}/>
      </div>


      <div ref={botItem3} 
          style={{opacity : 0}}
          className="absolute z-20 bottom-0 h-2/5 w-full flex items-center justify-center">
        <p className="text-amber-50 bg-[#222222f5] rounded-2xl 
          p-5 font-semibold text-xl">Muitos sites e soluções desenvolvidas para empresas, do back ao front, da ia ao BI,
          sempre presando a solução
        </p>
      </div>

    </div>
  );
}
