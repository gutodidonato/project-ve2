import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Fixed({ section }) {
  const fixedPos = useRef(null);
  const tl = useRef(null);
  let should_animate = (section >= 5 && section < 9);

  useEffect(() => {
    if (!fixedPos.current) return;

    if (section >= 5 && section < 9) {

      tl.current = gsap.to(fixedPos.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        pointerEvents: "none", 
      });
    } else {

      tl.current = gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
      });
    }
  }, [should_animate]);

  return (
    <div
      ref={fixedPos}
      style={{ opacity: 0 }}
      className="fixed w-screen h-screen top-0 z-20 pointer-events-none"
    >
      {/* Faixa superior central */}
      <div className="h-1/8 w-1/3 mx-auto mt-10 flex justify-center items-center">
        <p className="text-white text-shadow-lg shadow-black">Desenvolvimento Mobile</p>
      </div>

      {/* Faixa lateral esquerda */}
      <div className="bg-radial-[at_25%_25%] from-gray-300/60 to-zinc-900/50 to-75% border-2 rounded-lg border-gray-400 h-1/5 w-3/5 fixed left-1/5 right-1/5 bottom-10 flex justify-center items-center">
        <p className="text-white text-shadow-lg shadow-black">React Native</p>
      </div>

    </div>
  );
}
