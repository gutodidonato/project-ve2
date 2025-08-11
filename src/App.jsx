import { useEffect, useRef, useState } from "react";
import { ScrollControls, Scroll} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import Interface  from './components/scenes/Interface'
import ScrollManager from "./components/assets/ScrollManager";
import Menu from "./components/assets/Menu"
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Experience from './components/scenes/Experience';
import Fixed from "./components/scenes/Fixed";
import Beams from "./components/ui/Beams";
import gsap from "gsap";
import DarkVeilControl from "./components/ui/DarkVeilControl";

function App() {
  const tweenRef = useRef()

  const [section, setSection] = useState(0);

  let firstSection = section < 7;
  let secondSection = section >= 7 && section <= 9;
  let thirdSection = section > 9;
  
  const [index, setIndex] = useState(1);
  const [shouldAnimate, setShouldAnimate] = useState([false, true, false])
  const [beamChange, setBeamChange] = useState({
    rotation: 30,
    color: "#ffffff",
  });

  const [fundoLiquid, setFundoLiquid] = useState(-1);
  const [colorLiquid, setColorLiquid] = useState({ r: 1, g: 1, b: 1 });

  function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return {
      r: ((bigint >> 16) & 255) / 255,
      g: ((bigint >> 8) & 255) / 255,
      b: (bigint & 255) / 255,
    };
  }
  
  const updateShouldAnimate = (indexToSetTrue) => {
    setShouldAnimate(prev =>
      prev.map((_, idx) => idx === indexToSetTrue ? false : true)
  )};


  useEffect(() => {
    const target = {
      rotation: beamChange.rotation,
      color: beamChange.color,
    };

    if (firstSection && shouldAnimate[0]){

      updateShouldAnimate(0);

      tweenRef.current = gsap.to(target, {
        rotation: 30,
        color: "#ffffff",
        duration: 2.0,
        ease: "power2.out",
        onUpdate: () => {
          setBeamChange({
            rotation: target.rotation,
            color: target.color,
          });
        },
      });
    }

    else if (secondSection && shouldAnimate[1]) {

      updateShouldAnimate(1);

      tweenRef.current = gsap.to(target, {
        rotation: 180,
        color: "#ff0000",
        duration: 2.0,
        ease: "power2.out",
        onUpdate: () => {
          setBeamChange({
            rotation: target.rotation,
            color: target.color,
          });
        },
      });
    } 
      else if (thirdSection  && shouldAnimate[2]) {

      updateShouldAnimate(2);

      tweenRef.current = gsap.to(target, {
        rotation: 90,
        color: "#313131",
        duration: 2.0,
        ease: "power2.out",
        onUpdate: () => {
          setBeamChange({
            rotation: target.rotation,
            color: target.color,
          });
        },
      });
    } 
    

  }, [section]);


  useEffect(() => {
    let targetColorHex = "#969696";

    if (fundoLiquid === 0) targetColorHex = "#3cff00";
    else if (fundoLiquid === 1) targetColorHex = "#ff0000";
    else if (fundoLiquid === 2) targetColorHex = "#191dff";

    const targetColor = hexToRgb(targetColorHex);

    const colorObject = { ...colorLiquid }; 

    gsap.to(colorObject, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        setColorLiquid({ r: colorObject.r, g: colorObject.g, b: colorObject.b });
      },
    });
  }, [fundoLiquid]);


  let intensity = (section == 0 || section == 1)? 0 : section/3;

  return (
    <>
        <div className="relative w-screen h-screen">

        <div className="absolute top-0 left-0 w-full h-full z-0 bg-black">
        {/*Fundo Beams */}
        {section >= 3.9 && section < 14 && (
          
          <Beams
            beamWidth={1}
            beamHeight={30}
            beamNumber={200}
            lightColor={beamChange.color}
            speed={1.5}
            noiseIntensity={1}
            scale={0.2}
            rotation={beamChange.rotation}
          />
        )} 
        {section >= 14 && (
          <DarkVeilControl section={section} index={index}/>
        )}
        
        </div>
      

      <Canvas 
        shadows 
        camera={{ position: [3, 3, 3], fov: 30 }}>
        <ScrollControls pages={16} damping={0.1}>
          <ScrollManager section={section} onSectionChange={setSection}/>
          <EffectComposer>
          <Experience section={section}/>
          
            <Bloom intensity={intensity} luminanceThreshold={0.1} luminanceSmoothing={0.9}/>
          </EffectComposer>
          <Scroll html>
            <Interface/>
            <div className="h-screen w-screen"></div>
            <div className="h-screen w-screen"></div>
          </Scroll>
        </ScrollControls>
      </Canvas>
      <Fixed
        index={index}
        setIndex={setIndex} 
        section={section} 
        conteudo={fundoLiquid} 
        setConteudo={setFundoLiquid}/>
      </div>
    </>
  );
    
}
export default App;