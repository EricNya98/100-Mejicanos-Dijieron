import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import sampleQuestions from '../sampleQuestions.json';

interface SetupScreenProps {
  onGameCreated: (id: string) => void;
  onBack: () => void;
}

export default function SetupScreen({ onGameCreated, onBack }: SetupScreenProps) {
  const [team1, setTeam1] = useState('Equipo Azul');
  const [team2, setTeam2] = useState('Equipo Rojo');
  const [numRounds, setNumRounds] = useState(3);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);

    try {
      // Seed questions if none exist
      let qSnap;
      try {
        qSnap = await getDocs(query(collection(db, 'questions'), limit(1)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'questions');
        return;
      }

      if (qSnap.empty) {
        toast.info('Sembrando preguntas iniciales...');
        for (const q of sampleQuestions) {
          try {
            await addDoc(collection(db, 'questions'), q);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'questions');
          }
        }
      }

      // Get a random first question
      let questionsSnap;
      try {
        questionsSnap = await getDocs(collection(db, 'questions'));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'questions');
        return;
      }
      
      const questions = questionsSnap.docs.map(d => d.id);
      const firstQuestionId = questions[Math.floor(Math.random() * questions.length)];

      const gameData = {
        team1,
        team2,
        score1: 0,
        score2: 0,
        totalRounds: numRounds,
        currentRound: 1,
        currentQuestionId: firstQuestionId || '',
        roundPoints: 0,
        strikes: 0,
        activeTeam: 1,
        revealedAnswers: [],
        status: 'playing',
        moderatorId: 'public', // Set to public since no auth
        createdAt: serverTimestamp(),
      };

      let docRef;
      try {
        docRef = await addDoc(collection(db, 'games'), gameData);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'games');
        return;
      }
      
      toast.success('¡Juego configurado con éxito!');
      onGameCreated(docRef.id);
    } catch (error) {
      console.error(error);
      if (!(error instanceof Error && error.message.startsWith('{'))) {
        toast.error('Error al crear el juego');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-8 transition-opacity text-[#4a1d1d]"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-[#4a1d1d]">Configuración Sakura</h2>

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputGroup 
            label="Nombre Equipo 1" 
            value={team1} 
            onChange={setTeam1} 
            placeholder="Ej. Clan Sakura" 
          />
          <InputGroup 
            label="Nombre Equipo 2" 
            value={team2} 
            onChange={setTeam2} 
            placeholder="Ej. Clan Katana" 
          />
        </div>

        <div className="p-6 border border-[#ffb7c5] bg-white shadow-sm">
          <label className="block text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 mb-4 text-[#4a1d1d]">
            Número de Rondas
          </label>
          <div className="flex gap-4">
            {[3, 5, 7].map(n => (
              <button
                key={n}
                onClick={() => setNumRounds(n)}
                className={`flex-1 py-3 font-mono border transition-all ${
                  numRounds === n 
                    ? 'bg-[#d14d72] text-white border-[#d14d72]' 
                    : 'border-[#ffb7c5] text-[#4a1d1d] hover:border-[#d14d72]'
                }`}
              >
                {n} RONDAS
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={isCreating}
          onClick={handleCreateGame}
          className="w-full py-6 bg-[#d14d72] text-white font-black uppercase tracking-widest text-xl hover:bg-[#b03d5d] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-md"
        >
          {isCreating ? 'CREANDO...' : (
            <>
              <Save className="w-6 h-6" />
              Guardar y Jugar
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 text-[#4a1d1d]">
        {label}
      </label>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#ffb7c5] p-4 font-mono focus:outline-none focus:border-[#d14d72] transition-colors text-[#4a1d1d]"
      />
    </div>
  );
}
