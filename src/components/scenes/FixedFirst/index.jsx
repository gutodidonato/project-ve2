import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function FixedFirst({section}){
      const fixedPos = useRef(null);
      const botItem1 = useRef(null);

    useEffect(() => {
        const progress = Math.min(Math.max((section - 3.5) / 1.5, 0), 1); 

        if (section < 6.5 && section > 4.2) {
            gsap.to(botItem1.current, {
            opacity: progress,
            y: 100 * (1 - progress),
            duration: 1.0,
            ease: "power3.out",
            overwrite: "auto",
            })

            gsap.to(fixedPos.current, {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out",
                pointerEvents: "none", 
                overwrite: "auto",
            })
        }
        else {
            gsap.to(botItem1.current, {
                opacity: 0,
                y: 100,
                duration: 0.3,
                ease: "power2.in",
                overwrite: "auto",
        });
            gsap.to(fixedPos.current, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                pointerEvents: "none",
                overwrite: "auto"
        });
    }},[section])

    return(
        <>
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
            <div className="w-full fixed left-1/2 bottom-10 md:bottom-10 flex justify-center items-center transform -translate-x-1/2 px-4">
                <div className="w-full max-w-2xl">
                <p
                    ref={botItem1}
                    style={{ opacity: 0 }}
                    className="text-white text-shadow-lg/30 shadow-black text-center font-semibold font-open-sans text-md md:text-2xl"
                    >
                    Desenvolvo soluções digitais com foco em performance e experiência. Atuei nos projetos de streaming do Hospital Sírio-Libanês e da rede Posadas no México, com forte presença no mobile e frontend.
                </p>
                </div>
            </div>
        </>
    )
}