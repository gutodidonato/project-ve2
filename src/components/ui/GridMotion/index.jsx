import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

const GridMotion = ({ items = [], gradientColor = 'black', separar }) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);


  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  const [recovered, setRecovered] = useState(false)

useEffect(() => {
  if (separar === false && !recovered) {
    setRecovered(true);

    rowRefs.current.forEach((row, index) => {
      if (!row) return;

      row.classList.remove('run-row', 'reverse-row')

      const direction = index % 2 === 0 ? 1 : -1;

      gsap.to(row, {
        x: 4200 * direction,
        duration: 4,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  }
  else if (separar && recovered) {
    
    rowRefs.current.forEach((row, index) => {
      if (!row) return;
      
      gsap.to(row, {
        x: `25%`,
        duration: 4,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => {
          if (index % 2 === 0) {
            row.classList.add('run-row');
          } else {
            row.classList.add('reverse-row');
          }
          setRecovered(false);
        }
      });
    });
  }
}, [separar, recovered]);


  return (
    <div className="noscroll loading" ref={gridRef}>
      <section
        className="intro"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="gridMotion-container">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`row ${(rowIndex % 2 === 0) ? "run-row" : "reverse-row"}`}
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="row__item">
                    <div className="row__item-inner" style={{ backgroundColor: '#111' }}>
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="row__item-img"
                          style={{
                            backgroundImage: `url(${content})`,
                          }}
                        ></div>
                      ) : (
                        <div className="row__item-content">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="row__item">
                    <div className="row__item-inner" style={{ backgroundColor: '#111' }}>
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="row__item-img"
                          style={{
                            backgroundImage: `url(${content})`,
                          }}
                        ></div>
                      ) : (
                        <div className="row__item-content">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="fullview"></div>
      </section>
    </div>
  );
};

export default GridMotion;
