import GridMotion from "../GridMotion";

const items = [
  '/imgs/sites/site1.png',
  '/imgs/sites/site2.png',
  '/imgs/sites/site3.png',
  '/imgs/sites/site4.png',
  '/imgs/sites/site5.png',
  '/imgs/sites/site6.png',
  '/imgs/sites/site7.png',
  '/imgs/sites/site8.png',
  '/imgs/sites/site9.png',
  '/imgs/sites/site10.png',
  '/imgs/sites/site11.png',
  '/imgs/sites/site12.png',
  '/imgs/sites/site12.png',
  '/imgs/sites/site13.png',
  '/imgs/sites/site14.png',
  '/imgs/sites/site15.png',
  '/imgs/sites/site16.png',
  '/imgs/sites/site17.png',
  '/imgs/sites/site18.png',
  '/imgs/sites/site19.png',
  '/imgs/sites/site20.png',
  '/imgs/sites/site21.png',
  '/imgs/sites/site22.png',
  '/imgs/sites/site23.png',
  '/imgs/sites/site24.png',
  '/imgs/sites/site25.png',
  '/imgs/sites/site26.png',
  '/imgs/sites/site27.png',
  '/imgs/sites/site28.png',
  
];
function GridUi({separar}){  
    return (

        <GridMotion separar={separar} items={items} />
    )
}

export default GridUi;