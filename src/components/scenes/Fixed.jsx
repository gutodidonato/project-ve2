import { useEffect, useRef, useState } from "react";
import LastCard from "../ui/LastCard/Index";
import FixedFirst from "./FixedFirst";
import FixedSecond from "./FixedSecond";
import FixedThird from "./FixedThird";


export default function Fixed({ section, conteudo, setConteudo, index, setIndex }) {

  let first_animate = (section >= 4.5 && section < 6.5);
  let second_animate = (section >= 6.5 && section<= 9);
  let third_animate = (section > 9 && section < 14);
  let fourth_animate = (section >= 14 )
  

  return (
    <div className="fixed w-screen h-screen top-0 z-20 pointer-events-none">
      
      <FixedFirst section={section} />

      <FixedSecond phase={second_animate} />

      <FixedThird first_animate={first_animate} second_animate={second_animate} third_animate={third_animate} fourth_animate={fourth_animate} section={section} />

      {/* Etapa fim responsiva */}
      <div className="absolute top-0 w-full h-full flex items-center justify-around flex-col">
        <LastCard animate_state={fourth_animate} index={index} setIndex={setIndex} />
      </div>
    </div>
  );
}
