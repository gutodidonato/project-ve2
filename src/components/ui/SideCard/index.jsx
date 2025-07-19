import './style.css'

export default function SideCard({conteudo, setConteudo}) {

  return (
    <div onMouseLeave={() => setConteudo(-1)} class="sideCard">
      <p onMouseEnter={()=> setConteudo(0)}><span></span></p>
      <p onMouseEnter={()=> setConteudo(1)}><span></span></p>
      <p onMouseEnter={()=> setConteudo(2)}><span></span></p>
    </div>
  )
}
