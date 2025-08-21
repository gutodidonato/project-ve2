import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import GridUi from "../../ui/GridUi";


export default function FixedThird({ first_animate, second_animate, third_animate, fourth_animate, section}) {
  const botItem3 = useRef(null);
  const gridLayout = useRef(null);
  const [separar, setSeparar] = useState(true);

  useEffect(() => {
    if (first_animate) {

      gsap.set(gridLayout.current, {
        x: '500vw', 
        opacity: 0
      });

      gsap.to(botItem3.current, {
        opacity: 0,
        ease: "power1.Out"
      } )

    } else if(second_animate)  {

      gsap.to(gridLayout.current, {
        opacity: 0, 
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

    

      gsap.to(botItem3.current, {
        opacity: 1,
        duration: 3,
        ease: "power1.in",
        overwrite: "auto"
      } )

      
    }
    else if (fourth_animate){
      
    
      
      gsap.to(botItem3.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: "auto"
      });
  

    }
    
  }, [first_animate, second_animate, third_animate, fourth_animate]);

    useEffect(() => {

        if (section < 14 && !separar){
        setSeparar(true)
        }

        else if (section > 14 && separar){
        setSeparar(false)
        }}, 
    [section]);

  return (
    <>
      <div
        ref={gridLayout}
        style={{ opacity: 0 }}
        className="h-full w-full z-25 absolute top-0 overflow-visible"
      >
        <GridUi separar={separar} />
      </div>

      <div
        ref={botItem3}
        style={{ opacity: 0 }}
        className="absolute z-30 bottom-10 sm:bottom-0 h-auto min-h-[120px] w-full flex items-center justify-center px-2 pb-4"
      >
        <p className="text-amber-50 bg-[#222222f5] rounded-2xl p-3 md:p-5 font-semibold text-base md:text-xl text-center">
          Muitos sites e soluções desenvolvidas para empresas, do back ao front, da ia ao BI,
          sempre prezando a solução
        </p>
      </div>
    </>
  );
}
