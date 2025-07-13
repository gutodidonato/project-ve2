import { useEffect, useRef } from "react";
import gsap from "gsap";
import CardCarrossel from "../ui/CardCarrossel";

export default function Fixed({ section }) {
  const fixedPos = useRef(null);
  const botItem = useRef(null);
  const tl = useRef(null);
  let should_animate = (section >= 5 && section < 8);

  useEffect(() => {
    if (!fixedPos.current) return;

    if (section >= 5 && section < 8) {

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
      gsap.to(botItem.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        pointerEvents: "none",
      });
    }
  }, [should_animate]);

  useEffect(() => {
    if (!botItem.current) return;

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
    <div
      className="fixed w-screen h-screen top-0 z-20 pointer-events-none"
    >
      {/* Titulo superior Mobile */}
      <div ref={fixedPos}
      style={{ opacity: 0 }} className="h-2/8 w-1/3 mx-auto mt-10 flex justify-center items-center">
        <p className="text-white shadow-black text-shadow-lg/30 text-4xl font-bold text-center">Desenvolvimento Mobile</p>
      </div>


      <div className="w-full overflow-hidden">
          <CardCarrossel/>
      </div>

      {/* Descrição inferior */}
      <div className="h-1/5 w-3/5 fixed left-1/5 right-1/5 bottom-10 flex justify-center items-center">
        <div className="w-3/4">
          <p ref={botItem} style={{ opacity: 0}} className="text-white text-shadow-lg/30 shadow-black text-2xl text-center font-semibold font-open-sans">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo mollitia cumque architecto aut omnis incidunt ullam. Deleniti consequatur quidem ut modi dolor enim voluptate. Non amet quo voluptatem tenetur modi!
          </p>
        </div>
      </div>

    </div>
  );
}
