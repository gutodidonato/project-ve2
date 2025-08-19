import { useEffect, useState, useRef } from "react";
import LastCardComponent from "../../ui/LastCardComponent";
import TextType from "../../ui/TextType";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import gsap from "gsap";
import CircleMenu from "../../ui/Circular";


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


export default function LastCard({ animate_state = false, index, setIndex }) {
  const [frase, setFrase] = useState("");
  const fixedPos = useRef(null);

  useEffect(() => {
    if (index === 0) {
      setFrase(frases_eb);
    } else if (index === 1) {
      setFrase(frases_formacao);
    } else if (index === 2) {
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
    <div
      ref={fixedPos}
      className="w-screen h-screen flex items-center justify-around flex-col pointer-events-none"
      style={{ opacity: 0 }}
    >
      <div
        className="
          flex sm:flex-row flex-col 
          justify-between 
          sm:mb-80
          w-full h-7/10 
          sm:pl-50
          sm:mt-0 mt-0
          max-w-full max-h-full
          sm:w-8/10 sm:h-8/10
          sm:gap-10   
          px-2
        "
      >
        {/* Parte do CircleMenu */}
        <div
          className="flex items-center justify-center sm:w-1/3 w-full sm:h-full h-30 sm:mt-10 mt-20 sm:flex-row flex-col"
          style={{ pointerEvents: animate_state ? 'auto' : 'none' }}
        >
          <div className="h-full w-full rounded-full flex items-center justify-center">
            <CircleMenu index={index} setIndex={setIndex} />
          </div>
        </div>

        {/* Parte do texto */}
        <div className="flex items-start justify-start 
        sm:w-2/3 w-full sm:h-40 h-40 px-10 sm:pt-0 sm:pt-80">
          <TextType
            key={index}
            text={frase}
            typingSpeed={100}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            deletingSpeed={100}
            loop={true}
            className="text-white sm:text-4xl text-2xl text-center sm:text-left"
          />
        </div>
      </div>
      <div className="flex items-center justify-center w-full sm:gap-10 gap-3 pointer-events-none flex-wrap px-2 mt-20">
        <div
          className="bg-[#311688] rounded-4xl shadow-lg flex items-center justify-center h-20 w-20 cursor-pointer 
          transition-all duration-500 ease-in-out hover:scale-105 mb-3
          sm:h-20 sm:w-20 h-14 w-14"
          style={{ pointerEvents: animate_state ? "auto" : "none" }}
        >
          <a className="w-full h-full" href="https://github.com/gutodidonato" target="_blank" rel="noopener noreferrer">
            <FaGithub className="text-white w-full h-full p-5" />
          </a>
        </div>
        <div
          className="bg-[#311688] rounded-4xl shadow-lg flex items-center justify-center h-20 w-20 cursor-pointer 
          transition-all duration-500 ease-in-out hover:scale-105 mb-3
          sm:h-20 sm:w-20 h-14 w-14"
          style={{ pointerEvents: animate_state ? "auto" : "none" }}
        >
          <a className="w-full h-full" href="https://www.linkedin.com/in/luis-didonato-66746a250/" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn className="text-white w-full h-full p-5" />
          </a>
        </div>
        <div
          className="bg-[#311688] rounded-4xl shadow-lg flex items-center justify-center h-20 w-20 cursor-pointer 
          transition-all duration-500 ease-in-out hover:scale-105 mb-3
          sm:h-20 sm:w-20 h-14 w-14"
          style={{ pointerEvents: animate_state ? "auto" : "none" }}
        >
          <a className="w-full h-full" href="mailto:gutodidonato@gmail.com">
            <MdEmail className="text-white w-full h-full p-5" />
          </a>
        </div>
      </div>
    </div>
  );

}
