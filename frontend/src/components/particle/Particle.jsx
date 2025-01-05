import React,{useState,useEffect} from 'react'
import Particles from "@tsparticles/react";
import ParticleConfig from "./ParticleConfig";


import { loadSlim } from "@tsparticles/slim";
import  { initParticlesEngine } from "@tsparticles/react"
function Particle() {
  const [ init, setInit ] = useState(false);

  useEffect(() => {
      initParticlesEngine(async (engine) => {
         
          await loadSlim(engine);
      }).then(() => {
          setInit(true);
      });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
};

  return (
    <div>
      {init && <Particles id="tsparticles" options={ParticleConfig}  particlesLoaded={particlesLoaded} />}
    
    </div>
   
  )
}

export default Particle
