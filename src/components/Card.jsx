function Card(props) {
  return (
      <div className="bg-fundo-card rounded-lg p-2 w-30 mx-auto border-gray-600 border-1 inset-0 flex-col flex items-center">
        <h2 className="text-xl font-bold mb-4 text-white text-center">{props.title}</h2>
        <img className="w-15 h-15" src={props.img} loading="lazy-loading" alt={props.title} />
      </div>
  );
    
}
export default Card;