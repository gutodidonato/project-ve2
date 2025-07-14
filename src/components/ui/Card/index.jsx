function Card(props) {
  return (
    <div className="bg-red-700/10 rounded-lg p-4 w-40 mx-auto border border-gray-600 flex flex-col items-center shadow-2xl shadow-black/30 text-shadow-lg text-shadow-red-600/30">
      <h2 className="text-xl font-bold mb-4 text-white text-center capitalize">{props.title}</h2>
      <div className="[perspective:50px] w-15 h-15 flex items-center justify-center drop-shadow-xl/50 drop-shadow-red-500/50">
        <img
          className="w-15 h-15 object-contain -rotate-x-15 drop-shadow-xl"
          src={props.img}
          loading="lazy"
          alt={props.title}
        />
      </div>
    </div>
  );
}
export default Card;