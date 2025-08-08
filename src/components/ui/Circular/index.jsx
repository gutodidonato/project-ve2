import { useState } from 'react';
import LastCardComponent from "../LastCardComponent";

const items = [
  { id: 0, label: 'Item 0', image: "/imgs/br.png" },
  { id: 1, label: 'Item 1', image: "/imgs/br.png" },
  { id: 2, label: 'Item 2', image: "/imgs/br.png" },
];

export default function CircleMenu({index, setIndex}) {
  const [chosenIndex, setChosenIndex] = useState(0);
  const total = items.length;
  const radius = 120; 
  
  return (
    <div className="relative w-full h-full flex items-center justify-center rounded-full mx-auto">
    {items.map((item, i) => {
      const angleStep = 360 / total;
      const relativeIndex = (i - index + total) % total;
      const angleDeg = -270 + relativeIndex * angleStep;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      const radius = 150; 
      const x = radius * Math.cos(angleRad);
      const y = radius * Math.sin(angleRad);

      const size = 50;

      return (
        <div
        className='absolute transition-all duration-500 ease-in-out hover:scale-110'
          key={item.id}
          style={{
            position: "absolute",
            left: `calc(40% + ${x}px - ${size / 2}px)`,
            top: `calc(30% + ${y}px - ${size / 2}px)`,
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          <LastCardComponent
            setChosenIndex={setChosenIndex}
            natural_index={item.id}
            index={index}
            setIndex={setIndex}
            image_src={item.image}
          />
        </div>
            )})}
          </div>
        );
      }
