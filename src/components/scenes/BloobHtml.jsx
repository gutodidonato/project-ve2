import { useEffect, useRef } from "react";
import CardCarrossel  from "../components/CardCarrossel";
import gsap from "gsap";

function BloobHtml(props) {
  const {section} = props;
  const interBloobRef = useRef(null);
  const bloob1Ref = useRef(null);
  const bloob2Ref = useRef(null);
  const bloob3Ref = useRef(null);
  const bloob4Ref = useRef(null);
  const bloob5Ref = useRef(null);

  const needAnimateA = useRef(true);
  const needAnimateB = useRef(true);
  

  let posX = 0;
  let posY = 0;
  let tgX = 0;
  let tgY = 0;

  console.log("section: ", section)


  function bg_transition(element){
    if (section > 9 && section < 12){
      return `bloob_change_${element}`
    }
  }

  useEffect(() => {
    if (!interBloobRef.current) return;

    const move = () => {
      posX += (tgX - posX) / 20;
      posY += (tgY - posY) / 20;

      if (interBloobRef.current) {
        interBloobRef.current.style.transform = `translate(${Math.round(posX)}px, ${Math.round(posY)}px)`;
      }

      requestAnimationFrame(move);
    };

    move();

    const handleMouseMove = (e) => {
      tgX = e.clientX;
      tgY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };



  }, [interBloobRef]);

  useEffect(() => {
    if (section >= 9 && section <= 12 && needAnimateA.current == true) {
      needAnimateA.current = false;
      needAnimateB.current = true;

      [bloob1Ref, bloob2Ref, bloob3Ref, bloob4Ref, bloob5Ref].forEach((ref) => {
        if (ref.current) {
          gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.out" });
        }
      });
    }

  if ((section < 9 || section > 12) && needAnimateB.current == true){
    needAnimateA.current = true;
    needAnimateB.current = false;

    [bloob1Ref, bloob2Ref, bloob3Ref, bloob4Ref, bloob5Ref].forEach((ref) => {
    if (ref.current) {
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.out" });
    }
    });
  }
  }, [section]);



  return (
    <>
      {props.children}
      <div className="gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
                />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div ref={bloob1Ref} className={`bloob_1 bloob ${bg_transition(1)}`}></div>
          <div ref={bloob2Ref} className={`bloob_2 bloob ${bg_transition(2)}`}></div>
          <div ref={bloob3Ref} className={`bloob_3 bloob ${bg_transition(3)}`}></div>
          <div ref={bloob4Ref} className={`bloob_4 bloob ${bg_transition(4)}`}></div>
          <div ref={bloob5Ref} className={`bloob_5 ${bg_transition(5)}`}></div>
          <div ref={interBloobRef} className={`interactive ${bg_transition(6)}`}></div>
        </div>
      </div>
      {(section > 9)? (<CardCarrossel/>): null}
    </>
  );
}

export default BloobHtml;


/*
Agradecimento ao https://github.com/baunov/
*/