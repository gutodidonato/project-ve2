import { ScrollControls, Scroll} from "@react-three/drei";
import { Experience } from "./components/Experience";
import { Canvas } from "@react-three/fiber";
import Interface  from './components/Interface'
import { useState } from "react";
import ScrollManager from "./components/ScrollManager";
import Menu from "./components/Menu"
import { EffectComposer, Bloom } from '@react-three/postprocessing';


function App() {
  const [section, setSection] = useState(0);
  const [menuOpened, setMenuOpened] = useState(false);


  return (
    <>
      <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
        <color attach="background" args={['#000000']}/>
        <ScrollControls pages={4} damping={0.1}>
          <ScrollManager section={section} onSectionChange={setSection}/>
          <Experience/>
            <EffectComposer>
            <Bloom
              intensity={2} 
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
          <Scroll html>
            <Interface/>
          </Scroll>
        </ScrollControls>
      </Canvas>
      <Menu onSectionChange={setSection}
            menuOpened = {menuOpened}
            setMenuOpened = {setMenuOpened}
      />
    </>
  );
    
}
export default App;