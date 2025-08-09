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
                img='/imgs/stacks/python.svg'></Card>
            </li>
            <li className="item" key={keyFix + 2} style={{ '--position': 2 }}>
                <Card title="Javascript" 
                img='/imgs//stacks/javascript.svg'></Card>
            </li>
            <li className="item" key={keyFix + 3} style={{ '--position': 3 }}>
                <Card title="Typescript" 
                img='/imgs//stacks/typescript.svg'></Card>
            </li>
            <li className="item" key={keyFix + 4} style={{ '--position': 4 }}>
                <Card title="Java" 
                img='/imgs//stacks/java.svg'></Card>
            </li>
            <li className="item" key={keyFix + 5} style={{ '--position': 5 }}>
                <Card title="C#" 
                img='/imgs//stacks/dotnet.svg'></Card>
            </li>
            <li className="item" key={keyFix + 6} style={{ '--position': 6 }}>
                <Card title="Go" 
                img='/imgs//stacks/go.svg'></Card>
            </li>
            <li className="item" key={keyFix + 7} style={{ '--position': 7 }}>
                <Card title="Kotlin" 
                img='/imgs//stacks/kotlin.svg'></Card>
            </li>
            <li className="item" key={keyFix + 8} style={{ '--position': 8 }}>
                <Card title="Django" 
                img='/imgs//stacks/django.svg'></Card>
            </li>
            <li className="item" key={keyFix + 9} style={{ '--position': 9 }}>
                <Card title="React" 
                img='/imgs//stacks/react.svg'></Card>
            </li>
            <li className="item" key={keyFix + 10} style={{ '--position': 10 }}>
                <Card title="Tailwind" 
                img='/imgs//stacks/tailwind.svg'></Card>
            </li>
        
        </ul>
    </div>
  )
}