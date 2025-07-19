import { useEffect, useState } from "react";
import Card from "../Card";
import "./style.css";

export default function CardCarrossel(props) {

   const [keyFix, setKeyFix] = useState(Date.now());

   useEffect(()=>{
    requestAnimationFrame(() => {
        setKeyFix(Date.now());
      });

   }, [props.state])

  return (
    <div className={` overflow-hidden w-full h-screen justify-center top-10 fixed slider-elements`} style={{ transformStyle: 'preserve-3d' }}>
        <ul className={`absolute transform-3d w-3/5 flex gap-2`} style={{"--time": "15s", "--quantity": 10}}>
            <li className="item" key={keyFix + 1} style={{ '--position': 1 }}>
                <Card title="Python" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 2} style={{ '--position': 2 }}>
                <Card title="Javascript" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 3} style={{ '--position': 3 }}>
                <Card title="Typescript" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 4} style={{ '--position': 4 }}>
                <Card title="Java" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 5} style={{ '--position': 5 }}>
                <Card title="C#" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 6} style={{ '--position': 6 }}>
                <Card title="Go" img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 7} style={{ '--position': 7 }}>
                <Card title="Kotlin" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 8} style={{ '--position': 8 }}>
                <Card title="hero" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 9} style={{ '--position': 9 }}>
                <Card title="hero" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
            <li className="item" key={keyFix + 10} style={{ '--position': 10 }}>
                <Card title="hero" 
                img='https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'></Card>
            </li>
        
        </ul>
    </div>
  )
}