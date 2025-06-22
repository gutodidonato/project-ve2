import { motion } from "framer-motion";

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
      <StartAboutMe />
      <ContactSection />
    </div>
  );
};

const AboutSection = () => {
  return (
    <Section>
      <div className=" bg-gradient-to-br from-blue-500/80 to-purple-600/80 p-5 rounded-2xl border-amber-50 border-1">
      <h1 className="text-xl text-white leading-snug text-shadow-2xs">
        Hi, I'm
        <br />
      </h1>
      <div className="w-full flex justify-center">
        <span className="text-7xl font-orbitron2
         text-center text-white font-extrabold text-shadow-lg/30 text-shadow-black">Luis <br/> Didonato</span>
      </div>
      <div className="overflow-hidden h-15 mt-5 bg-purple-600/60 rounded-lg">
        <p className="text-4xl capitalize text-center font-sans font-bold text-sky-400 text-shadow-lg/30 text-shadow-black">Fullstack Developer</p>
        <p className="text-4xl capitalize text-center font-sans font-bold text-sky-400 text-shadow-lg/30 text-shadow-black">Mobile Developer</p>
        <p className="text-4xl capitalize text-center font-sans font-bold text-sky-400 text-shadow-lg/30 text-shadow-black">AI Engineer</p>
      </div>
      <div className="w-full flex justify-center">
      <motion.button
        className={`bg-indigo-600 text-white py-4 px-8 
          rounded-lg font-bold text-lg mt-5 hover:bg-indigo-900 transition-colors duration-75 ease-in cursor-pointer`}
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 10,
          }}
          transition={{
            duration: 1,
            delay: 1,
          }}
          >
        Contact me
      </motion.button>
      </div>
      </div>
    </Section>
  );
};

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
      className="bg-gradient-to-br from-blue-500/80 to-purple-600/80 p-10 border-amber-50 border-1 rounded-2xl">
        <h2 className="text-5xl font-bold text-white text-shadow-lg/50 text-shadow-black">Skills</h2>
        <div className=" mt-8 space-y-4">
          {skills.map((skill, index) => (
            <div className="w-64" key={index}>
              <motion.h3
                className="text-xl font-bold text-white text-shadow-2xs text-shadow-black"
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
              <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
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
          <h2 className="text-5xl font-bold mt-10 text-white text-shadow-lg/50 text-shadow-black">Languages</h2>
          <div className=" mt-8 space-y-4">
            {languages.map((lng, index) => (
              <div className="w-64" key={index}>
                <motion.h3
                  className="text-xl font-bold text-white text-shadow-2xs text-shadow-black"
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
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
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


const StartAboutMe = () => {
  return (
    <Section>
      <div className="bg-gradient-to-br from-blue-500/80 to-purple-600/80 p-10
       border-amber-50 border-1 rounded-2xl z-[-9]">
      <div className="w-64 h-64 bg-gray-800 absolute
       border-cyan-500 border-6 rounded-full b-30 z--10 mt-[-260px] z-[-10] shadow-[inset_4px_5px_13px_#00bcda99] ">
      </div>
      <img className="w-70 h-auto absolute mt-[-240px] z-[-9]" 
      src="/imgs/profile2.png" alt="" />
      <div className="z-[-8]">
        <p className="text-5xl font-bold text-white text-shadow-lg/50 text-shadow-black">
          About me
        </p>
        <p className="mt-4 text-lg text-white">
          I am a Fullstack Developer with a passion for creating innovative solutions. 
          <br />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque, delectus!
        </p>
        <p>
          Já trabalhei na empresa redbit/ valiant group, onde desenvolvi aplicações web e mobile utilizando React, React Native, Next.js, Python, Django e FastAPI.
        </p>
      </div>
      </div>
    </Section>
  );
}

const ContactSection = () => {
  return (
    <Section>
      <h2 className="text-5xl font-bold">Contact me</h2>
      <div className="mt-8 p-8 rounded-md bg-white w-96 max-w-full">
        <form>
          <label for="name" className="font-medium text-gray-900 block mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-3"
          />
          <label
            for="email"
            className="font-medium text-gray-900 block mb-1 mt-8"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-3"
          />
          <label
            for="email"
            className="font-medium text-gray-900 block mb-1 mt-8"
          >
            Message
          </label>
          <textarea
            name="message"
            id="message"
            className="h-32 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-3"
          />
          <button className="bg-indigo-600 text-white py-4 px-8 rounded-lg font-bold text-lg mt-16 ">
            Submit
          </button>
        </form>
      </div>
    </Section>
  );
};

export default Interface;