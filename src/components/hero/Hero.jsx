import Card from "./components/Card";

function Hero() {
  return (
    <>
      <div class="w-screen h-screen flex items-center justify-center bg-cover bg-center relative radiant-vermelho">
        <div class="w-screen h-120 flex items-center justify-center bg-cover bg-center relative overflow-hidden">
          <div class= "card absolute">
          </div>
          <div>
            <Card></Card>
          </div>
        </div>
      </div>
      
    </>
  );
    
}
export default Hero;