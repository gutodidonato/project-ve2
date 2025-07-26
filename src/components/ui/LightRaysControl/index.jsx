import LightRays from "../LightRays"
export default function LightRaysControl({section}) {
    console.log('valor:' + section)

    
  return (
        <div 
        style={{filter: `brightness(${section - 14})`}}
        className="w-full h-full z-100">
              <LightRays
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={1}
                lightSpread={0.5}
                rayLength={5}
                followMouse={false}
                mouseInfluence={0.1}
                noiseAmount={0}
                distortion={0}
                className="custom-rays"
                />
        </div>
  )
}
