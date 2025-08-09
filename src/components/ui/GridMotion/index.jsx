import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

const GridMotion = ({ items = [], gradientColor = 'black', separar }) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  const [recovered, setRecovered] = useState(false);
  const [currentGradientColor, setCurrentGradientColor] = useState(gradientColor);
  let distance =  window.innerWidth < 1200?  8400 : 4200

  useEffect(() => {
    if (separar === false && !recovered) {
      setRecovered(true);
      setCurrentGradientColor('transparent');

      rowRefs.current.forEach((row, index) => {
        if (!row) return;

        row.classList.remove('run-row', 'reverse-row')

        const direction = index % 2 === 0 ? 1 : -1;

        gsap.to(row, {
          x: distance * direction,
          duration: 4,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
    }
else if (separar && recovered) {
  setCurrentGradientColor('black');

  rowRefs.current.forEach((row, index) => {
    if (!row) return;

    // Calcula deslocamento baseado na largura real da linha
    const perc = window.innerWidth < 1200 ? -0.25 : 0.25;
    const moveX = row.offsetWidth * perc;

    gsap.to(row, {
      x: moveX,
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
          background: `radial-gradient(circle, ${currentGradientColor} 0%, transparent 100%)`,
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
                      {typeof content === 'string'? (
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
                      {typeof content === 'string'? (
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
