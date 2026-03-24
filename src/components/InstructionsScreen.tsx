import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Users, Trophy, AlertCircle } from 'lucide-react';

interface InstructionsScreenProps {
  onBack: () => void;
}

export default function InstructionsScreen({ onBack }: InstructionsScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto p-6 pb-20"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-8 transition-opacity text-[#4a1d1d]"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="text-center mb-16">
        <BookOpen className="w-12 h-12 text-[#d14d72] mx-auto mb-4" />
        <h2 className="text-5xl font-black uppercase tracking-tighter text-[#4a1d1d]">Reglas Sakura</h2>
        <p className="text-sm font-mono opacity-50 mt-2 text-[#4a1d1d]">CÓMO MODERAR LA DINÁMICA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RuleCard 
          icon={<Users className="w-6 h-6 text-[#d14d72]" />}
          title="Equipos"
          description="Se forman dos clanes. El moderador controla quién tiene el turno actual desde el panel inferior."
        />
        <RuleCard 
          icon={<Trophy className="w-6 h-6 text-[#d14d72]" />}
          title="Puntaje"
          description="Cada respuesta tiene un valor basado en su popularidad. ¡Atención! En la penúltima ronda los puntos valen doble (x2)."
        />
        <RuleCard 
          icon={<AlertCircle className="w-6 h-6 text-red-500" />}
          title="Strikes (X)"
          description="Si un equipo da una respuesta que no está en el tablero, recibe un Strike. Al acumular 3 Strikes, el equipo contrario tiene una oportunidad de robar los puntos."
        />
        <RuleCard 
          icon={<BookOpen className="w-6 h-6 text-[#d14d72]" />}
          title="Moderación"
          description="Como moderador, tú decides cuándo revelar una respuesta o marcar un error. Usa los botones del panel inferior para controlar el flujo."
        />
      </div>

      <div className="mt-16 p-8 border-4 border-[#ffb7c5] bg-white shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[#4a1d1d]">Flujo de la Ronda</h3>
        <ol className="space-y-4 font-mono text-sm list-decimal list-inside opacity-80 text-[#4a1d1d]">
          <li>Se presenta la pregunta a ambos clanes.</li>
          <li>El clan con el turno intenta adivinar las respuestas más populares.</li>
          <li>Si aciertan, se revela la respuesta y se suman puntos a la ronda.</li>
          <li>Si fallan, se marca un Strike.</li>
          <li>Si llegan a 3 Strikes, el otro clan intenta adivinar una sola respuesta para robarse los puntos.</li>
          <li>Al final, el moderador asigna los puntos al clan ganador y pasa a la siguiente ronda.</li>
        </ol>
      </div>
    </motion.div>
  );
}

function RuleCard({ icon, title, description }: any) {
  return (
    <div className="p-6 border border-[#ffb7c5] bg-white hover:bg-[#fff5f7] transition-colors shadow-sm">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-black uppercase tracking-tighter mb-2 text-[#4a1d1d]">{title}</h4>
      <p className="text-sm opacity-60 leading-relaxed text-[#4a1d1d]">{description}</p>
    </div>
  );
}
