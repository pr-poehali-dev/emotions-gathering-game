import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Emotion = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  collected: boolean;
};

type GameState = 'menu' | 'playing' | 'finished';

const GAME_DURATION = 60;
const EMOTIONS_COUNT = 20;
const EMOTION_EMOJIS = ['😊', '😢', '😡', '😱', '❤️', '😴', '🤗', '😎', '🤔', '🎉'];

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });

  const generateEmotions = useCallback(() => {
    const newEmotions: Emotion[] = [];
    for (let i = 0; i < EMOTIONS_COUNT; i++) {
      newEmotions.push({
        id: i,
        emoji: EMOTION_EMOJIS[Math.floor(Math.random() * EMOTION_EMOJIS.length)],
        x: Math.random() * 85 + 5,
        y: Math.random() * 85 + 5,
        collected: false,
      });
    }
    return newEmotions;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setPlayerPos({ x: 50, y: 50 });
    setEmotions(generateEmotions());
    setScore(0);
    setTimeLeft(GAME_DURATION);
  };

  const restartGame = () => {
    startGame();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        e.preventDefault();
        setKeys((prev) => {
          const newKeys = { ...prev };
          if (key === 'w' || key === 'arrowup') newKeys.w = true;
          if (key === 'a' || key === 'arrowleft') newKeys.a = true;
          if (key === 's' || key === 'arrowdown') newKeys.s = true;
          if (key === 'd' || key === 'arrowright') newKeys.d = true;
          return newKeys;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => {
        const newKeys = { ...prev };
        if (key === 'w' || key === 'arrowup') newKeys.w = false;
        if (key === 'a' || key === 'arrowleft') newKeys.a = false;
        if (key === 's' || key === 'arrowdown') newKeys.s = false;
        if (key === 'd' || key === 'arrowright') newKeys.d = false;
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveInterval = setInterval(() => {
      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.a) newX = Math.max(0, prev.x - 1);
        if (keys.d) newX = Math.min(95, prev.x + 1);
        if (keys.w) newY = Math.max(0, prev.y - 1);
        if (keys.s) newY = Math.min(95, prev.y + 1);

        return { x: newX, y: newY };
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [keys, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    emotions.forEach((emotion) => {
      if (!emotion.collected) {
        const distance = Math.sqrt(
          Math.pow(playerPos.x - emotion.x, 2) + Math.pow(playerPos.y - emotion.y, 2)
        );

        if (distance < 5) {
          setEmotions((prev) =>
            prev.map((e) =>
              e.id === emotion.id ? { ...e, collected: true } : e
            )
          );
          setScore((prev) => prev + 1);
        }
      }
    });
  }, [playerPos, emotions, gameState]);

  const progress = (score / EMOTIONS_COUNT) * 100;
  const uncollectedEmotions = emotions.filter((e) => !e.collected);

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-accent p-4">
        <Card className="p-12 max-w-lg w-full text-center shadow-2xl">
          <h1 className="text-6xl font-heading font-bold mb-4 text-primary">
            Собери Эмоции
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Управляй персонажем стрелками или WASD и собирай все эмоции на поле за {GAME_DURATION} секунд!
          </p>
          <Button
            onClick={startGame}
            size="lg"
            className="text-xl px-12 py-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            Начать игру
          </Button>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-accent p-4">
        <Card className="p-12 max-w-lg w-full text-center shadow-2xl">
          <h1 className="text-5xl font-heading font-bold mb-4 text-primary">
            Игра окончена!
          </h1>
          <div className="text-8xl my-8 animate-bounce-in">
            {score === EMOTIONS_COUNT ? '🎉' : '😊'}
          </div>
          <p className="text-3xl font-semibold mb-2">
            Собрано: {score} из {EMOTIONS_COUNT}
          </p>
          <p className="text-xl text-muted-foreground mb-8">
            {score === EMOTIONS_COUNT
              ? 'Идеально! Ты собрал все эмоции!'
              : score >= EMOTIONS_COUNT * 0.7
              ? 'Отличный результат!'
              : score >= EMOTIONS_COUNT * 0.4
              ? 'Хорошая попытка!'
              : 'Попробуй ещё раз!'}
          </p>
          <Button
            onClick={restartGame}
            size="lg"
            className="text-xl px-12 py-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            Играть снова
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-accent p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex gap-6 items-center justify-between flex-wrap">
          <Card className="p-4 flex-1 min-w-[200px]">
            <p className="text-sm text-muted-foreground mb-1">Время</p>
            <p className="text-3xl font-bold font-heading">{timeLeft}с</p>
          </Card>
          <Card className="p-4 flex-1 min-w-[200px]">
            <p className="text-sm text-muted-foreground mb-1">Счёт</p>
            <p className="text-3xl font-bold font-heading">
              {score}/{EMOTIONS_COUNT}
            </p>
          </Card>
          <Card className="p-4 flex-1 min-w-[200px]">
            <p className="text-sm text-muted-foreground mb-1">Прогресс</p>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="p-2 shadow-2xl">
          <div className="relative w-full bg-muted rounded-xl overflow-hidden" style={{ paddingBottom: '75%' }}>
            <div className="absolute inset-0">
              <div
                className="absolute w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-75 ease-linear animate-pulse-soft"
                style={{
                  left: `${playerPos.x}%`,
                  top: `${playerPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                🙂
              </div>

              {uncollectedEmotions.map((emotion) => (
                <div
                  key={emotion.id}
                  className="absolute w-10 h-10 flex items-center justify-center text-3xl animate-float transition-all duration-300"
                  style={{
                    left: `${emotion.x}%`,
                    top: `${emotion.y}%`,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${emotion.id * 0.1}s`,
                  }}
                >
                  {emotion.emoji}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center mt-6 text-muted-foreground text-lg">
          Управление: стрелки ← ↑ ↓ → или W A S D
        </p>
      </div>
    </div>
  );
};

export default Index;