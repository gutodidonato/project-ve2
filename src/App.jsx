import { useState } from "react";
import { ScrollControls, Scroll} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Interface  from './components/scenes/Interface'
import ScrollManager from "./components/assets/ScrollManager";
import Menu from "./components/assets/Menu"
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Experience from './components/scenes/Experience';
import Fixed from "./components/scenes/Fixed";
import Beams from "./components/ui/Beams"
import { div } from "motion/react-client";


function App() {
  const [section, setSection] = useState(0);
  const [menuOpened, setMenuOpened] = useState(false);
  const [color, setColor] = useState("bg-black");


  let intensity = (section == 0 || section == 1)? 0 : section/3;

  return (
    <>
        <div className="relative w-screen h-screen">
        {/* BloobHtml como background */}
        {section < 3.9 && (
          <div className="absolute top-0 left-0 w-full h-full z-0 bg-black"></div>
        )}
        {section >= 3.9 && (
          <div className="absolute top-0 left-0 w-full h-full z-0">
            <Beams
              beamWidth={1}
              beamHeight={30}
              beamNumber={200}
              lightColor="#ffffff"
              speed={1.5}
              noiseIntensity={1}
              scale={0.2}
              rotation={30}
            />
          </div>
        )}
      

      <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
        <ScrollControls pages={16} damping={0.1}>
          <ScrollManager section={section} onSectionChange={setSection}/>
          <EffectComposer>
          <Experience/>
          
            <Bloom intensity={intensity} luminanceThreshold={0.1} luminanceSmoothing={0.9}/>
          </EffectComposer>
          <Scroll html>
            <Interface/>
            <div className="h-screen w-screen"></div>
            <div className="h-screen w-screen"></div>
          </Scroll>
        </ScrollControls>
      </Canvas>
      <Menu onSectionChange={setSection}
            menuOpened = {menuOpened}
            setMenuOpened = {setMenuOpened}
            />
      <Fixed section={section} />
      </div>
    </>
  );
    
}
export default App;