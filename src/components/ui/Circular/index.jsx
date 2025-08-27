import { useState } from 'react';
import LastCardComponent from "../LastCardComponent";

const items = [
  { id: 0, label: "Item 0", image: "/imgs/eng-eb.png", video: "/video/aman.mp4"},
  { id: 1, label: "Item 1", image: "/imgs/eng-eb.png",  video: "/video/fiap.mp4"},
  { id: 2, label: "Item 2", image: "/imgs/stacks/python.svg", video: "/video/comemoracao.mp4"},
];

let isMobile =  window.innerWidth < 1200

export default function CircleMenu({ index, setIndex }) {
  const [chosenIndex, setChosenIndex] = useState(index ?? 1);

  const total = items.length;

  const radiusChosen = isMobile? 160: 180;      
  const radiusOthers = isMobile? 70: 90;    

  return (
    <div
      className="relative w-full h-full flex items-center justify-center rounded-full mx-auto"
    >
      {items.map((item, i) => {
        const angleStep = 360 / total;
        const relativeIndex = (i - chosenIndex + total) % total;
        const angleDeg = -270 + relativeIndex * angleStep; 
        const angleRad = (angleDeg * Math.PI) / 180;

        const isChosen = chosenIndex == item.id;
        const radius = isChosen ? radiusChosen : radiusOthers;

        const x = radius * Math.cos(angleRad);
        const y = radius * Math.sin(angleRad);




        const size = isChosen ? (isMobile? 230 : 295) : (isMobile? 100 : 140);

        return (
          <div
            key={item.id}
            className="absolute cursor-pointer transition-all duration-500 ease-in-out hover:scale-105"
            style={{
              left: `calc(50% + ${x}px - ${size / 2}px)`,
              top: `calc(50% + ${y}px - ${size / 2}px)`,
              width: `${size}px`,
              height: `${size}px`,
              zIndex: isChosen ? 10 : 1,
            }}
          >
            <LastCardComponent
              natural_index={item.id}
              video_src={item.video}
              index={index}
              setIndex={setIndex}
              setChosenIndex={setChosenIndex}
              image_src={item.image}
              size={size}
            />
          </div>
        );
      })}
    </div>
  );
}
