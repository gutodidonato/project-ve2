import DarkVeil from "../DarkVeil";

export default function DarkVeilControl({section}) {
    console.log('valor:' + section)

    
  return (
        <div 
        style={{filter: `brightness(${Math.min(section - 14.6, 1)})`}}
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
