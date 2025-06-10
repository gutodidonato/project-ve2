import { useState } from "react";
import { ScrollControls, Scroll} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Interface  from './components/Interface'
import ScrollManager from "./components/ScrollManager";
import Menu from "./components/Menu"
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import CardCarrossel from "./components/CardCarrossel";
import { Wall } from "./components/Wall";
import Experience from './components/Experience';
import Navbar from './components/Navbar';

function App() {
  const [section, setSection] = useState(0);
  const [menuOpened, setMenuOpened] = useState(false);
  const [page, setPage] = useState(0)

  let intensity = (section == 0 || section == 1)? 0 : 2;

  return (
    <>
      <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
        <color attach="background" args={['#000000']}/>
        <ScrollControls pages={8} damping={0.1}>
          <ScrollManager section={section} onSectionChange={setSection}/>
          <EffectComposer>
          <Experience/>
          
            <Bloom intensity={intensity} luminanceThreshold={0.1} luminanceSmoothing={0.9}/>
          </EffectComposer>
          <Scroll html>
            <Interface/>
            <div className="h-screen w-screen"></div>
            <div className="h-screen w-screen"></div>
            <CardCarrossel/>
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