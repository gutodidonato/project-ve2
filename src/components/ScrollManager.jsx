import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { gsap } from 'gsap';

const ScrollManager = (props) => {
    const {section, onSectionChange} = props;
    const data = useScroll();



    useFrame(() =>{
        const curSection = (data.scroll.current * data.pages);
        onSectionChange(curSection)
        console.log(section)
    })

  return null;
}

export default ScrollManager;