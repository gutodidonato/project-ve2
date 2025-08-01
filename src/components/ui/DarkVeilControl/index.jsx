import DarkVeil from "../DarkVeil";

export default function DarkVeilControl({section}) {
    console.log('valor:' + Math.min(section - 14.2, 1))

    
  return (
        <div 
        style={{filter: `brightness(${Math.min(section - 13.5, 1)})`}}
        className="w-full h-full z-100 bananinha">
              <DarkVeil
                hueShift={5}
                noiseIntensity={0.01}
                scanlineIntensity={1}
                speed={0.8}
                scanlineFrequency={0}
                warpAmount={0}
                resolutionScale={1}
                
                
              />
        </div>
  )
}
