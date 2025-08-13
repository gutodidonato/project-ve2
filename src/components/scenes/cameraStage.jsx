import * as THREE from 'three';


const cameraStages = window.innerWidth < 1500? [
    {
      //traseira
      start: 0.0,
      end: (0.20)/4,
      from: new THREE.Vector3(20, -1, -8),
      to: new THREE.Vector3(15.66, -0.83, -6.31),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(1, 0, 0),
    },
    {
      //esquerda 
      start: (0.20)/4,
      end: (0.50)/4, 
      from: new THREE.Vector3(15.66, -0.83, -6.31),
      to: new THREE.Vector3(-3, 1, 25),
      lookFrom: new THREE.Vector3(1, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      //frente_1
      start: (0.50)/4,
      end: (0.70)/4,
      from: new THREE.Vector3(-3, 1, 25),
      to: new THREE.Vector3(-7.41, -1, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      //frente_2
      start: (0.70)/4,
      end: (0.80)/4,
      from: new THREE.Vector3(-7.41, -1, 10),
      to: new THREE.Vector3(-7.41, 10, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 1, 0),
    },
    {
      //entrando espelho
      start: (0.80)/4,
      end:(1.00)/4,
      from: new THREE.Vector3(-7.41, 10, 10),
      to: new THREE.Vector3(1.8, -1.5, -1),
      lookFrom: new THREE.Vector3(0, 1, 0),
      lookTo: new THREE.Vector3(7, -9, -5),
    },
    {
      start: (1.00)/4,
      end:(3.00)/4,
      from: new THREE.Vector3(2, 1, 0),
      to: new THREE.Vector3(2, 1, 0),
      lookFrom: new THREE.Vector3(7, -9, -5),
      lookTo: new THREE.Vector3(5, -4, -3),
    },

  ] : [
    {
      //traseira
      start: 0.0,
      end: (0.20)/4,
      from: new THREE.Vector3(14, 0, -7),
      to: new THREE.Vector3(20, -0.83, -6.31),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(1, 0, 0),
    },
    {
      //esquerda 
      start: (0.20)/4,
      end: (0.50)/4, 
      from: new THREE.Vector3(20, -0.83, -6.31),
      to: new THREE.Vector3(-7, -1, 20),
      lookFrom: new THREE.Vector3(1, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      //frente_1
      start: (0.50)/4,
      end: (0.70)/4,
      from: new THREE.Vector3(-7, -1, 20),
      to: new THREE.Vector3(-7.41, -1, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 0, 0),
    },
    {
      //frente_2
      start: (0.70)/4,
      end: (0.80)/4,
      from: new THREE.Vector3(-7.41, -1, 10),
      to: new THREE.Vector3(-7.41, 10, 10),
      lookFrom: new THREE.Vector3(0, 0, 0),
      lookTo: new THREE.Vector3(0, 1, 0),
    },
    {
      //entrando espelho
      start: (0.80)/4,
      end:(1.00)/4,
      from: new THREE.Vector3(-7.41, 10, 10),
      to: new THREE.Vector3(2, 1, 0),
      lookFrom: new THREE.Vector3(0, 1, 0),
      lookTo: new THREE.Vector3(5, -3, -3),
    },
    {
      start: (1.00)/4,
      end:(3.00)/4,
      from: new THREE.Vector3(2, 1, 0),
      to: new THREE.Vector3(2, 1, 0),
      lookFrom: new THREE.Vector3(5, -4, -3),
      lookTo: new THREE.Vector3(5, -4, -3),
    },

  ]
export default cameraStages