import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, login, logout } from './firebase';
import { Toaster, toast } from 'sonner';
import StartScreen from './components/StartScreen';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import InstructionsScreen from './components/InstructionsScreen';
import { LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type Screen = 'start' | 'setup' | 'game' | 'instructions';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleStartGame = (id: string) => {
    setGameId(id);
    setCurrentScreen('game');
  };

  const handleGoToSetup = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para configurar un juego');
      login().catch(err => toast.error('Error al iniciar sesión'));
      return;
    }
    setCurrentScreen('setup');
  };

  const handleGoToInstructions = () => {
    setCurrentScreen('instructions');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          CARGANDO SISTEMA...
        </motion.div>
      </div>
    );
  }

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
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] uppercase opacity-50 font-bold tracking-widest">Moderador</p>
                <p className="text-xs font-mono">{user.displayName || user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => login().catch(err => toast.error('Error al iniciar sesión'))}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-[#00ff00] hover:text-[#00ff00] transition-all text-xs font-bold uppercase tracking-widest"
            >
              <UserIcon className="w-4 h-4" />
              Acceso Moderador
            </button>
          )}
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
              user={user} 
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
              user={user} 
              onExit={() => setCurrentScreen('start')}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
