import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import CardCarrossel from "../../ui/CardCarrossel";

export default function FixedSecond({phase}){

      const carrosselCard = useRef(null);
      const botItem2 = useRef(null);
      const [carrosselState, setCarrosselState] = useState(true);

    useEffect(() => {

        if (phase) {
            setCarrosselState(true)

            gsap.to(carrosselCard.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power1.in",
                overwrite: "auto"
            })
            
            

            gsap.to(botItem2.current, {
                opacity: 1,
                duration: 0.3,
                delay: 0.5,
                ease: "power2.in",
                pointerEvents: "none",
                overwrite: "auto"
            });
        }
        else {
            setCarrosselState(false)

            gsap.to(carrosselCard.current, {
                opacity: 0,
                duration: 0.5,
                ease: "power1.in",
                overwrite: "auto",
            })

            gsap.to(botItem2.current, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                overwrite: "auto",
                pointerEvents: "none",
            });
    }},[phase])



    return(
        <>
            <div
                    ref={carrosselCard}
                    style={{ opacity: 0 }}
                    className="w-full flex justify-center items-center overflow-hidden px-2"
                  >
                    <CardCarrossel state={carrosselState} />
                  </div>
            
                  {/* Segunda descrição responsiva */}
                  <div className="w-full max-w-2xl fixed left-1/2 md:bottom-10 bottom-2 flex justify-center items-center transform -translate-x-1/2 px-4">
                    <div className="w-full flex justify-center items-center">
                      <p
                        ref={botItem2}
                        style={{ opacity: 0 }}
                        className="text-white text-shadow-lg/30 shadow-black text-center font-semibold font-open-sans text-md md:text-2xl"
                      >
                        Tenho domínio total sobre diferentes stacks e linguagens — programo com fluidez em qualquer tecnologia, ajustando à necessidade do projeto. Além do desenvolvimento full stack, também atuo com IA, aplicando modelos e integrações em aplicações reais.
                      </p>
                    </div>
                  </div>
        </>
    )
}