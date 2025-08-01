import { useEffect, useState, useRef } from "react";
import LastCardComponent from "../LastCardComponent";
import TextType from "../TextType";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import gsap from "gsap";

let imagem_eb = "/imgs/br.png";

let frases_eb = ["Ingressei na academia militar das agulhas negras em 2020",
  "Fui treinado para ser um oficial do exército brasileiro",
  "Refinei habilidades de liderança e disciplina",
]

let frases_formacao = [
  "Graduado analista de sistemas em 2023 pela FIAP",
  "Aprendendo de matérias desde lógica de programação até inteligência artificial",
  "Aprimorando habilidades técnicas e práticas em tecnologia",
]

let frases_atual = [
  "Atualmente atuo como desenvolvedor fullstack",
  "Trabalhando com as tecnologias necessárias para resolver problemas reais",
  "Buscando sempre aprender e evoluir na área de desenvolvimento web",
]


export default function LastCard({ animate_state = false }) {
  const [index, setIndex] = useState(null);
  const [frase, setFrase] = useState("");
  const fixedPos = useRef(null);

  useEffect(() => {
    if (index === 1) {
      setFrase(frases_eb);
    } else if (index === 2) {
      setFrase(frases_formacao);
    } else if (index === 3) {
      setFrase(frases_atual);
    } else {
      setFrase([""]);
    }
  },[index]);

  useEffect(() => {
    if (animate_state) {
      gsap.to(fixedPos.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
    else{
      gsap.to(fixedPos.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [animate_state]);


  return (
  <div ref={fixedPos}
    className="w-screen h-screen flex items-center justify-around flex-col pointer-events-none"
    style={{ opacity: 1 }}>
    <div className="flex items-center flex-col justify-center w-full pointer-events-none">
      <p className="text-white text-2xl">
        Mais um pouco sobre mim
      </p>
      <div className="flex items-center justify-center w-full gap-10 mt-10"
        style={{ pointerEvents: animate_state ? "auto" : "none" }}>
        <LastCardComponent natural_index={1} index={index} setIndex={setIndex} image_src={imagem_eb}/>
        <LastCardComponent natural_index={2} index={index} setIndex={setIndex} image_src={imagem_eb}/>
        <LastCardComponent natural_index={3} index={index} setIndex={setIndex} image_src={imagem_eb}/>
      </div>
    </div>
    <div className="mt-20">
      <TextType 
        key={index}
        text={frase}
        typingSpeed={100}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="|"
        deletingSpeed={100}
        loop={true}
        className="text-white text-2xl"
      />
    </div>
    <div className="flex items-center justify-center w-full gap-10 pointer-events-none">
      <div className="bg-[#311688] rounded-4xl shadow-lg flex items-center justify-center h-20 w-20 cursor-pointer"
      style={{ pointerEvents: animate_state ? "auto" : "none" }}>
        <FaGithub className="text-white w-full h-full p-5" />
      </div>
      <div className="bg-[#311688] rounded-4xl shadow-lg flex items-center justify-center h-20 w-20 cursor-pointer"
      style={{ pointerEvents: animate_state ? "auto" : "none" }}>
        <FaLinkedinIn className="text-white w-full h-full p-5" />
      </div>
      <div className="bg-[#311688] rounded-4xl shadow-lg flex items-center justify-center h-20 w-20 cursor-pointer"
      style={{ pointerEvents: animate_state ? "auto" : "none" }}>
        <MdEmail  className="text-white w-full h-full p-5" />
      </div>
    </div>
  </div>
);

}
