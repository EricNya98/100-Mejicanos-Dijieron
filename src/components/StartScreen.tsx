import React from 'react';
import { motion } from 'motion/react';
import { Play, Settings, BookOpen, Maximize } from 'lucide-react';

interface StartScreenProps {
  onStart: (gameId: string) => void;
  onSetup: () => void;
  onInstructions: () => void;
}

export default function StartScreen({ onStart, onSetup, onInstructions }: StartScreenProps) {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6 relative z-10">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-4 text-[#4a1d1d]">
          100<br />
          <span className="text-[#d14d72]">JAPONESES</span><br />
          <span className="italic font-light">DIJERON</span>
        </h1>
        <p className="text-sm font-mono uppercase tracking-[0.3em] opacity-50">
          Panel de Conducción Sakura
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <MenuButton 
          icon={<Play className="w-6 h-6" />}
          label="Iniciar Partida"
          description="Comienza con el último juego activo"
          onClick={() => onStart('last-game')}
          color="bg-[#d14d72] text-white"
        />
        <MenuButton 
          icon={<Settings className="w-6 h-6" />}
          label="Configurar Juego"
          description="Nombres de equipos y rondas"
          onClick={onSetup}
          color="bg-white border-[#ffb7c5] text-[#4a1d1d]"
        />
        <MenuButton 
          icon={<BookOpen className="w-6 h-6" />}
          label="Instrucciones"
          description="Cómo moderar la dinámica"
          onClick={onInstructions}
          color="bg-white border-[#ffb7c5] text-[#4a1d1d]"
        />
        <MenuButton 
          icon={<Maximize className="w-6 h-6" />}
          label="Pantalla Completa"
          description="Mejor experiencia visual"
          onClick={toggleFullScreen}
          color="bg-white border-[#ffb7c5] text-[#4a1d1d]"
        />
      </div>
    </div>
  );
}

function MenuButton({ icon, label, description, onClick, color = "bg-white border-[#ffb7c5]" }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: '#fff' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${color} p-6 border flex flex-col items-start text-left transition-all group shadow-sm`}
    >
      <div className="mb-4 group-hover:scale-110 transition-transform text-[#d14d72]">{icon}</div>
      <div className="font-black uppercase tracking-wider text-lg">{label}</div>
      <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono mt-1">{description}</div>
    </motion.button>
  );
}
