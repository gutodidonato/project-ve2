export default function LastCard({ animate_state = false }) {
return (
  <div
    className="w-screen h-screen flex items-center justify-top flex-col"
    style={{ perspective: '1000px', opacity: 1 }}
  >
    {/* Parte superior do fliperama */}
    <div className="w-3/10 h-2/5 bg-red-600 rounded-t-xl shadow-xl flex items-center justify-center">
      <video 
        src="/video/sample1.mp4"></video>
    </div>

    {/* Parte da tela inclinada */}
    <div
      className="w-4/10 h-2/5 bg-blue-600 rounded-b-xl"
      style={{
        transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
        transformStyle: 'preserve-3d',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Tela embutida no painel inclinado */}
      <div
        className="w-full h-2/5 bg-red-300"
        style={{
          transform: 'translateZ(40px) rotateX(-15deg)',
        }}
      />
    </div>
  </div>
);

}
