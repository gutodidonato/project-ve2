import { useEffect, useRef } from "react";

function BloobHtml(props) {
  const interBloobRef = useRef(null);
  let posX = 0;
  let posY = 0;
  let tgX = 0;
  let tgY = 0;

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
          <div className="bloob_1 bloob"></div>
          <div className="bloob_2 bloob"></div>
          <div className="bloob_3 bloob"></div>
          <div className="bloob_4 bloob"></div>
          <div className="bloob_5"></div>
          <div className="interactive" ref={interBloobRef}></div>
        </div>
      </div>
    </>
  );
}

export default BloobHtml;


/*
Agradecimento ao https://github.com/baunov/
*/