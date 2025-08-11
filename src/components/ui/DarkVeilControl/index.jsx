import { useEffect, useRef, useState } from "react";
import DarkVeil from "../DarkVeil";
import gsap from "gsap";

export default function DarkVeilControl({section, index}) {
    console.log('valor:' + Math.min(section - 14.2, 1))

    const [color, setColor] = useState(0)
    let background = useRef(null)

  useEffect(()=>{
    if (section > 14){
      if (index == 0){
        gsap.to(background.current, {
          filter: `hue-rotate(0deg)`,
          duration: 2.0,
          ease: "power1.in"
        })
      }
      else if (index == 1){
        gsap.to(background.current, {
          filter: `hue-rotate(30deg)`,
          duration: 2.0,
          ease: "power1.in"
        })
      }
      else if (index == 2){
        gsap.to(background.current, {
          filter: `hue-rotate(90deg)`,
          duration: 2.0,
          ease: "power1.in"
        })
      }
    }
    else{
        gsap.to(background.current, {
          filter: `hue-rotate(180deg)`,
          duration: 2.0,
          ease: "power1.in"
        })
    }
  }
  ,[index, section])

    
  return (
        <div 
          ref={background}
          style={{filter: `brightness(${Math.min(section - 13.5, 1)})`}}
          className="w-full h-full z-100">
              <DarkVeil
                hueShift={5}
                noiseIntensity={0.01}
                scanlineIntensity={1}
                speed={0.8}
                scanlineFrequency={0}
                warpAmount={0}
                resolutionScale={1}
                
                
              />
        </div>
  )
}
