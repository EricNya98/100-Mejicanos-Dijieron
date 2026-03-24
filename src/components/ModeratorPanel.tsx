import React from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X, Check, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface ModeratorPanelProps {
  game: any;
  gameId: string;
  question: any;
  onReveal: (idx: number) => void;
  onStrike: () => void;
  onAssign: (team: number) => void;
  onNext: () => void;
}

export default function ModeratorPanel({ game, gameId, question, onReveal, onStrike, onAssign, onNext }: ModeratorPanelProps) {
  const toggleTurn = async () => {
    await updateDoc(doc(db, 'games', gameId), {
      activeTeam: game.activeTeam === 1 ? 2 : 1
    });
  };

  const resetStrikes = async () => {
    await updateDoc(doc(db, 'games', gameId), {
      strikes: 0
    });
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/20 p-6 z-50 shadow-2xl"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-between">
        {/* Answer Controls */}
        <div className="flex-1 w-full">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-4">Control de Respuestas</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {question.answers.map((ans: any, idx: number) => (
              <button
                key={idx}
                disabled={game.revealedAnswers.includes(idx)}
                onClick={() => onReveal(idx)}
                className={`py-3 px-2 text-[10px] font-black uppercase tracking-tighter border transition-all ${
                  game.revealedAnswers.includes(idx)
                    ? 'bg-white/10 text-white/20 border-white/5'
                    : 'bg-white/5 hover:bg-[#00ff00] hover:text-black border-white/10'
                }`}
              >
                Revelar {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex flex-col gap-2">
            <button
              onClick={onStrike}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-5 h-5" /> Strike
            </button>
            <button
              onClick={resetStrikes}
              className="px-6 py-3 border border-white/20 hover:border-white/40 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Limpiar X
            </button>
          </div>

          <div className="flex-1 md:flex-none flex flex-col gap-2">
            <button
              onClick={toggleTurn}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowRight className="w-5 h-5" /> Cambiar Turno
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onAssign(1)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-blue-500/20 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Puntos E1
              </button>
              <button
                onClick={() => onAssign(2)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Puntos E2
              </button>
            </div>
          </div>
        </div>

        {/* Round Controls */}
        <div className="w-full md:w-auto">
          <button
            onClick={onNext}
            className="w-full px-8 py-6 bg-[#00ff00] text-black font-black uppercase tracking-widest text-lg hover:bg-white transition-colors flex items-center justify-center gap-3"
          >
            <Award className="w-6 h-6" /> Siguiente Pregunta
          </button>
        </div>
      </div>
    </motion.div>
  );
}
