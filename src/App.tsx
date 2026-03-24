import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, login, logout } from './firebase';
import { Toaster, toast } from 'sonner';
import StartScreen from './components/StartScreen';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import InstructionsScreen from './components/InstructionsScreen';
import { motion, AnimatePresence } from 'motion/react';

export type Screen = 'start' | 'setup' | 'game' | 'instructions';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [gameId, setGameId] = useState<string | null>(null);

  const handleStartGame = (id: string) => {
    setGameId(id);
    setCurrentScreen('game');
  };

  const handleGoToSetup = () => {
    setCurrentScreen('setup');
  };

  const handleGoToInstructions = () => {
    setCurrentScreen('instructions');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ff00] selection:text-black">
      <Toaster position="top-center" richColors />
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div 
          className="font-black text-xl tracking-tighter cursor-pointer hover:text-[#00ff00] transition-colors"
          onClick={() => setCurrentScreen('start')}
        >
          100 MEXICANOS <span className="italic">DIJERON</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase opacity-50 font-bold tracking-widest">Panel de Conducción</p>
            <p className="text-xs font-mono">Modo Abierto</p>
          </div>
        </div>
      </header>

      <main className="pt-20 min-h-screen">
        <AnimatePresence mode="wait">
          {currentScreen === 'start' && (
            <StartScreen 
              key="start" 
              onStart={handleStartGame} 
              onSetup={handleGoToSetup} 
              onInstructions={handleGoToInstructions}
            />
          )}
          {currentScreen === 'setup' && (
            <SetupScreen 
              key="setup" 
              onGameCreated={handleStartGame}
              onBack={() => setCurrentScreen('start')}
            />
          )}
          {currentScreen === 'instructions' && (
            <InstructionsScreen 
              key="instructions" 
              onBack={() => setCurrentScreen('start')}
            />
          )}
          {currentScreen === 'game' && gameId && (
            <GameScreen 
              key="game" 
              gameId={gameId} 
              onExit={() => setCurrentScreen('start')}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
