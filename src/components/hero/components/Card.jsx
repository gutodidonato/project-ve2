function Card(props) {
  return (
    <>
      <div className="bg-fundo-card rounded-lg shadow-lg p-6 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-white">Título do Card</h2>
        <p className="text-gray-400 mb-4">
          Este é um exemplo de conteúdo dentro do card. Você pode personalizar
          este texto conforme necessário.
          </p>
      </div>
      
    </>
  );
    
}
export default Card;