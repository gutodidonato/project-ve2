import { OrbitControls, useHelper } from '@react-three/drei'

const DebugCamera = () => {

  return (
    <>
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </>
  )
}
