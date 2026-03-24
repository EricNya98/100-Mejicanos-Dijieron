import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, login, logout } from './firebase';
import { Toaster, toast } from 'sonner';
import StartScreen from './components/StartScreen';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import InstructionsScreen from './components/InstructionsScreen';
import SakuraBackground from './components/SakuraBackground';
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
    <div className="min-h-screen bg-[#fff5f7] text-[#4a1d1d] selection:bg-[#ffb7c5] selection:text-[#4a1d1d] relative overflow-x-hidden">
      <SakuraBackground />
      <Toaster position="top-center" richColors />
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center border-b border-[#ffb7c5]/30 bg-white/70 backdrop-blur-md">
        <div 
          className="font-black text-xl tracking-tighter cursor-pointer hover:text-[#d14d72] transition-colors flex items-center gap-2"
          onClick={() => setCurrentScreen('start')}
        >
          <span className="text-[#d14d72]">100 JAPONESES</span> <span className="italic font-light">DIJERON</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase opacity-50 font-bold tracking-widest">Panel de Conducción</p>
            <p className="text-xs font-mono text-[#d14d72]">Modo Sakura</p>
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
