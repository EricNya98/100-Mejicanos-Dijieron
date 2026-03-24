import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { toast } from 'sonner';
import { X, Trophy, Volume2, VolumeX, ChevronRight, RotateCcw, LogOut } from 'lucide-react';
import ModeratorPanel from './ModeratorPanel';

interface GameScreenProps {
  gameId: string;
  onExit: () => void;
}

interface Answer {
  text: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

interface GameData {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  totalRounds: number;
  currentRound: number;
  currentQuestionId: string;
  roundPoints: number;
  strikes: number;
  activeTeam: number;
  revealedAnswers: number[];
  status: 'setup' | 'playing' | 'finished';
  moderatorId: string;
}

// Sound URLs
const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  victory: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // A more triumphant sound
};

export default function GameScreen({ gameId, onExit }: GameScreenProps) {
  const [game, setGame] = useState<GameData | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (gameId === 'last-game') {
      // Find the most recent game
      const q = query(
        collection(db, 'games'),
        limit(1)
      );
      getDocs(q).then(snap => {
        if (!snap.empty) {
          const id = snap.docs[0].id;
          subscribeToGame(id);
        } else {
          toast.error('No se encontró ningún juego previo');
          onExit();
        }
      });
    } else {
      subscribeToGame(gameId);
    }
  }, [gameId]);

  const subscribeToGame = (id: string) => {
    const unsub = onSnapshot(doc(db, 'games', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GameData;
        setGame(data);
        if (data.currentQuestionId) {
          fetchQuestion(data.currentQuestionId);
        }
      } else {
        toast.error('El juego no existe');
        onExit();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `games/${id}`);
    });
    return () => unsub();
  };

  const fetchQuestion = async (qId: string) => {
    const qSnap = await getDoc(doc(db, 'questions', qId));
    if (qSnap.exists()) {
      setQuestion({ id: qSnap.id, ...qSnap.data() } as Question);
    }
  };

  const playSound = (type: keyof typeof SOUNDS) => {
    if (muted) return;
    const audio = new Audio(SOUNDS[type]);
    audio.play().catch(() => {});
  };

  const handleReveal = async (index: number) => {
    if (!game || !question || game.revealedAnswers.includes(index)) return;
    
    const newRevealed = [...game.revealedAnswers, index];
    const isPenultimateRound = game.currentRound === game.totalRounds - 1;
    const pointsMultiplier = isPenultimateRound ? 2 : 1;
    const points = question.answers[index].points * pointsMultiplier;
    
    playSound('correct');
    
    try {
      await updateDoc(doc(db, 'games', gameId), {
        revealedAnswers: newRevealed,
        roundPoints: game.roundPoints + points
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  const handleStrike = async () => {
    if (!game) return;
    const newStrikes = game.strikes + 1;
    
    playSound('error');
    
    if (newStrikes >= 3) {
      toast.warning('¡3 STRIKES! El otro equipo puede robar.');
    }
    
    try {
      await updateDoc(doc(db, 'games', gameId), {
        strikes: newStrikes
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  const handleAssignPoints = async (teamNum: number) => {
    if (!game) return;
    const scoreKey = teamNum === 1 ? 'score1' : 'score2';
    const newScore = (game as any)[scoreKey] + game.roundPoints;
    const isLastRound = game.currentRound >= game.totalRounds;
    
    try {
      await updateDoc(doc(db, 'games', gameId), {
        [scoreKey]: newScore,
        roundPoints: 0,
        strikes: 0,
        revealedAnswers: [],
        currentRound: game.currentRound + 1,
        status: isLastRound ? 'finished' : 'playing'
      });
      
      if (isLastRound) {
        playSound('victory');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${gameId}`);
    }
    
    toast.success(`Puntos asignados al ${teamNum === 1 ? game.team1 : game.team2}`);
    handleNextQuestion();
  };

  const handleNextQuestion = async () => {
    const qSnap = await getDocs(collection(db, 'questions'));
    const questions = qSnap.docs.map(d => d.id);
    const nextQ = questions[Math.floor(Math.random() * questions.length)];
    
    try {
      await updateDoc(doc(db, 'games', gameId), {
        currentQuestionId: nextQ,
        strikes: 0,
        revealedAnswers: [],
        roundPoints: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  if (!game || !question) return null;

  if (game.status === 'finished') {
    const winner = game.score1 > game.score2 ? game.team1 : game.team2;
    const isTie = game.score1 === game.score2;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6 relative z-10"
      >
        <Trophy className="w-32 h-32 text-[#d14d72] mb-8" />
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-[#4a1d1d]">
          {isTie ? '¡EMPATE!' : '¡GANADOR!'}
        </h2>
        <div className="bg-[#d14d72] text-white px-12 py-6 text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 shadow-lg">
          {isTie ? 'NADIE GANA' : winner}
        </div>
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-[#4a1d1d]">{game.team1}</p>
            <p className="text-5xl font-mono font-bold text-[#d14d72]">{game.score1}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-[#4a1d1d]">{game.team2}</p>
            <p className="text-5xl font-mono font-bold text-[#d14d72]">{game.score2}</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="px-12 py-6 border-4 border-[#d14d72] text-[#d14d72] hover:bg-[#d14d72] hover:text-white transition-all font-black uppercase tracking-widest text-2xl shadow-md"
        >
          Volver al Inicio
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pb-32">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-12 border-b border-[#ffb7c5]/30 pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 text-[#4a1d1d]">
            Ronda {game.currentRound} {game.currentRound === game.totalRounds - 1 && <span className="text-[#d14d72] ml-2 font-black">¡PUNTOS X2!</span>}
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#4a1d1d]">
            Turno: <span className={game.activeTeam === 1 ? 'text-[#d14d72]' : 'text-[#b03d5d]'}>
              {game.activeTeam === 1 ? game.team1 : game.team2}
            </span>
          </h2>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setMuted(!muted)} className="p-2 hover:bg-[#ffb7c5]/20 rounded-full transition-colors text-[#d14d72]">
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={onExit} className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Scores & Strikes */}
        <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
          <ScoreCard name={game.team1} score={game.score1} active={game.activeTeam === 1} color="pink" />
          <ScoreCard name={game.team2} score={game.score2} active={game.activeTeam === 2} color="cherry" />
          
          <div className="p-6 border border-[#ffb7c5] bg-white shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-4 text-[#4a1d1d]">Strikes</p>
            <div className="flex justify-center gap-4">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={game.strikes >= i ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-black transition-colors ${
                    game.strikes >= i ? 'border-[#d14d72] text-[#d14d72] bg-[#d14d72]/10' : 'border-[#ffb7c5]/30 text-[#ffb7c5]/30'
                  }`}
                >
                  X
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Question & Board */}
        <div className="lg:col-span-9 space-y-8 order-1 lg:order-2">
          <motion.div 
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 border-4 border-[#d14d72] bg-white text-[#4a1d1d] text-center shadow-md"
          >
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
              "{question.text}"
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.answers.map((ans, idx) => (
              <AnswerSlot 
                key={idx} 
                index={idx + 1} 
                answer={ans} 
                revealed={game.revealedAnswers.includes(idx)} 
              />
            ))}
          </div>

          <div className="flex justify-center">
            <div className="bg-[#d14d72] text-white px-8 py-4 font-black text-4xl tracking-tighter shadow-lg">
              PUNTOS: {game.roundPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Moderator Panel */}
      <ModeratorPanel 
        game={game} 
        gameId={gameId} 
        question={question}
        onReveal={handleReveal}
        onStrike={handleStrike}
        onAssign={handleAssignPoints}
        onNext={handleNextQuestion}
      />
    </div>
  );
}

function ScoreCard({ name, score, active, color }: any) {
  const colorClass = color === 'pink' ? 'border-[#ffb7c5]' : 'border-[#d14d72]';
  const bgClass = color === 'pink' ? 'bg-[#ffb7c5]/20' : 'bg-[#d14d72]/10';
  const textClass = color === 'pink' ? 'text-[#d14d72]' : 'text-[#b03d5d]';

  return (
    <div className={`p-6 border-l-4 ${colorClass} ${active ? bgClass : 'bg-white'} transition-colors shadow-sm`}>
      <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${active ? textClass : 'opacity-50'}`}>
        {active ? 'Jugando Ahora' : 'En Espera'}
      </p>
      <h4 className="text-xl font-black uppercase tracking-tighter truncate text-[#4a1d1d]">{name}</h4>
      <p className="text-4xl font-mono font-bold mt-2 text-[#d14d72]">{score}</p>
    </div>
  );
}

function AnswerSlot({ index, answer, revealed }: { index: number, answer: Answer, revealed: boolean }) {
  return (
    <div className="h-16 relative perspective-1000">
      <motion.div
        initial={false}
        animate={{ rotateX: revealed ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Front (Hidden) */}
        <div className="absolute inset-0 backface-hidden bg-white border border-[#ffb7c5] flex items-center justify-between px-6 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#ffb7c5]/20 flex items-center justify-center font-bold text-sm text-[#d14d72]">
            {index}
          </div>
          <div className="flex-1 mx-4 border-b border-dashed border-[#ffb7c5]/30"></div>
          <div className="text-[#ffb7c5] font-mono">??</div>
        </div>

        {/* Back (Revealed) */}
        <div className="absolute inset-0 backface-hidden bg-[#d14d72] text-white flex items-center justify-between px-6 rotate-x-180 shadow-md">
          <div className="font-black uppercase tracking-tight text-lg truncate flex-1 mr-4">
            {answer.text}
          </div>
          <div className="font-mono font-bold text-2xl border-l border-white/20 pl-4">
            {answer.points}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
