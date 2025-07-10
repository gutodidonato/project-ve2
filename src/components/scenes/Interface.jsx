import { AnimatePresence, motion } from "framer-motion";
import { use, useEffect, useState } from "react";
import ProfileCard from '../ui/ProfileCard'

const Section = (props) => {
  const { children } = props;

  return (
    <motion.section
      className={`
  h-screen w-screen p-8 max-w-screen-2xl mx-auto
  flex flex-col items-start justify-center
  `}
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          delay: 0.6,
        },
      }}
    >
      {children}
    </motion.section>
  );
};

export const Interface = () => {
  return (
    <div className="flex flex-col items-center w-screen">
      <AboutSection />
      <SkillsSection />
      <MyRole/>
    </div>
  );
};


const AboutSection = () => {
  const [index, setIndex] = useState(0);

  const palavra1 = ['F', 'U', 'L', 'L', '\u00A0', 'S', 'T', 'A', 'C', 'K'];
  const palavra2 = ['A', 'I', '\u00A0', 'E', 'N', 'G', 'I', 'N', 'E', 'E', 'R'];
  const palavra3 = ['D','E','V','\u00A0','S','O','B','E','R','B','O'];
  const palavra4 = ['S','Ó','\u00A0','F','A','Z','\u00A0','F','R','O','N','T'];
  const palavra5 = ['S','Ó', '\u00A0', 'P', 'Y', 'T','H','O', 'N'];
  const palavra6 = ['C','O','M','I','T','\u00A0','F','I','N','A','L'];
  const palavra7 = ['D','E','V','\u00A0','M', 'O', 'B', 'I', 'L', 'E'];
  const palavra8 = ['P','U','S','H','\u00A0','N','A','\u00A0','M','A','I','N'];
  const palavra9 = ['C', 'A', 'F', 'É', '+', 'C', 'A', 'F', 'É'];
  const palavra10 = ['F', 'R', 'A', 'N', 'G', 'O'];

  let condicoes_boas = (index == 0 || index == 1 || index == 6 || index == 8 || index == 9)


  const palavras = [ palavra1, palavra2, palavra3, palavra4, palavra5, palavra6, palavra7, palavra8, palavra9, palavra10 ]



const palavraAnimada = (palavra, certo) => {
  return (
    <div className="flex gap-1">
      {palavra.map((letra, index) => {
        const isPar = index % 2 === 0;
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: isPar ? 30 : -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isPar ? 30 : -30 }}
            transition={{
              duration: 1,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            className={`text-3xl capitalize text-center font-sans font-bold 
              ${(certo)? `text-sky-400`: `text-red-400` }
              ${isPar ? `par_${Math.floor(index / 2)}` : `inpar_${Math.floor(index / 2)}`}
              `}
          >
            {letra}
          </motion.span>
        );
      })}
    </div>
  );
};

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % palavras.length);
    }, 5000); 

    return () => clearInterval(intervalo);
  }, []);


  return (
    <Section>
      <div className=" bg-gradient-to-br from-[#172436] to-[#8e1e839e] p-5 rounded-2xl border-[#0dbaf5] border-1">
      <h1 className="text-xl text-white leading-snug text-shadow-2xs">
        Hi, I'm
        <br />
      </h1>
      <div className="w-full flex justify-center">
        <span className="text-7xl font-orbitron2
         text-center text-white font-extrabold text-shadow-lg/30 text-shadow-black">Luis <br/> Didonato</span>
      </div>
      <div className="overflow-hidden h-15 mt-5 bg-[#ffffff1a] rounded-lg flex items-center justify-center">
          {      
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0 }}
              className="flex"
            >
          {palavraAnimada(palavras[index], (condicoes_boas)? true : false)}
          {
            <span className="text-lg flex items-center justify-center text-white font-bold ml-2">
              {(condicoes_boas) ? '✅' : '❌'}
            </span> 
          }
          </motion.div>
        </AnimatePresence>
        }
      </div>
      <div className="w-full flex justify-center">
      </div>
      </div>
    </Section>
  );
}

const skills = [
  {
    title: "Python / Django / FastAPI",
    level: 90, 
  },
  {
    title: "React / React Native / Next.js",
    level: 90, 
  },
  {
    title: "Pandas / Selenium / Scrapy",
    level: 85, 
  },
  {
    title: "Kotlin / Java / C#",
    level: 70, 
  },
  {
    title: "Node.js / Express / Go",
    level: 50, 
  },
];

const languages = [
  {
    title: "BR - Português",
    level: 100,
  },
  {
    title: "US - Inglês",
    level: 80,
  },
  {
    title: "ES  - Espanhol",
    level: 20,
  },
];

const SkillsSection = () => {
  return (
    <Section>
      <motion.div whileInView={"visible"} 
      className="bg-gradient-to-br from-[#172436] to-[#8e1e839e] p-10 border-[#0dbaf5] border-1 rounded-2xl">
        <h2 className="text-4xl font-bold text-white text-shadow-lg/50 text-shadow-black">Skills</h2>
        <div className=" mt-4 space-y-2">
          {skills.map((skill, index) => (
            <div className="w-64" key={index}>
              <motion.h3
                className="text-lg font-bold text-white text-shadow-2xs text-shadow-black"
                initial={{
                  opacity: 0,
                }}
                variants={{
                  visible: {
                    opacity: 1,
                    transition: {
                      duration: 1,
                      delay: 1 + index * 0.2,
                    },
                  },
                }}
              >
                {skill.title}
              </motion.h3>
              <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2">
                <motion.div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${skill.level}%` }}
                  initial={{
                    scaleX: 0,
                    originX: 0,
                  }}
                  variants={{
                    visible: {
                      scaleX: 1,
                      transition: {
                        duration: 1,
                        delay: 1 + index * 0.2,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-4xl font-bold mt-8 text-white text-shadow-lg/50 text-shadow-black">Languages</h2>
          <div className=" mt-4 space-y-2">
            {languages.map((lng, index) => (
              <div className="w-64" key={index}>
                <motion.h3
                  className="text-lg font-bold text-white text-shadow-2xs text-shadow-black"
                  initial={{
                    opacity: 0,
                  }}
                  variants={{
                    visible: {
                      opacity: 1,
                      transition: {
                        duration: 1,
                        delay: 2 + index * 0.2,
                      },
                    },
                  }}
                >
                  {lng.title}
                </motion.h3>
                <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2">
                  <motion.div
                    className="h-full bg-purple-400 rounded-full "
                    style={{ width: `${lng.level}%` }}
                    initial={{
                      scaleX: 0,
                      originX: 0,
                    }}
                    variants={{
                      visible: {
                        scaleX: 1,
                        transition: {
                          duration: 1,
                          delay: 2 + index * 0.2,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
};


const NullRole = () => {
  return(
    <Section>
    </Section>
  )
}

const MyRole = () => {
  
  return(
    <Section>
      <div className="w-96 mt-200 ml-2 opacity-95">
      <ProfileCard
        name="Luis Didonato"
        title="Fullstack"
        handle="luishtml"
        status="Online"
        contactText="Entre em contato"
        avatarUrl="/imgs/profile1.png"
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() => console.log('Contact clicked')}
      />
      </div>
      <div className="bg-[#172436] opacity-92 p-7 border-[#0dbaf5] border-1 rounded-2xl z-[-9] mt-10 w-98 ml-2">
        <div className="rotating-text-container h-24 overflow-hidden relative">
          <div className="relative h-24 flex colum flex-col gap-15 animate-rotateSteps">
            <p className="text-item left-0 w-full text-xl text-white text-center">Desenvolvedor Full Stack apaixonado por transformar ideias em soluções reais.</p>
            <p className="text-item left-0 w-full text-xl text-white text-center">Curioso por natureza, estudo IA, linguagens, dados e automações.</p>
            <p className="text-item left-0 w-full text-xl text-white text-center">Comprometido com soluções inovadoras e código de qualidade.</p>
            <p className="text-item left-0 w-full text-xl text-white text-center">Sempre aprendendo e evoluindo como profissional de tecnologia.</p>
          </div>
        </div>
      </div>


    </Section>
  )
}



export default Interface;