'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// 遊戲常數
const COURT_WIDTH = 800;
const COURT_HEIGHT = 500;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const NET_HEIGHT = 150;
const NET_WIDTH = 4;

// 物理常數
const GRAVITY = 0.3;
const FRICTION = 0.99;
const BOUNCE_DAMPING = 0.85;
const INITIAL_BALL_SPEED = 5;
const MAX_BALL_SPEED = 12;

// 遊戲狀態
type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

// 波嘅狀態
interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  trail: { x: number; y: number }[];
}

// 球拍狀態
interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isAI: boolean;
  score: number;
}

export default function PickleballGameAdvanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [rallyCount, setRallyCount] = useState(0);
  const [maxRally, setMaxRally] = useState(0);
  
  // 遊戲對象
  const ballRef = useRef<Ball>({
    x: COURT_WIDTH / 2,
    y: COURT_HEIGHT / 2,
    vx: INITIAL_BALL_SPEED,
    vy: 0,
    speed: INITIAL_BALL_SPEED,
    trail: []
  });
  
  const playerPaddleRef = useRef<Paddle>({
    x: 50,
    y: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    vy: 0,
    isAI: false,
    score: 0
  });
  
  const aiPaddleRef = useRef<Paddle>({
    x: COURT_WIDTH - 50 - PADDLE_WIDTH,
    y: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    vy: 0,
    isAI: true,
    score: 0
  });
  
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseXRef = useRef<number>(0);
  const mouseYRef = useRef<number>(0);
  const useMouseRef = useRef<boolean>(false);

  // 初始化遊戲
  const initGame = useCallback(() => {
    ballRef.current = {
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
      vy: (Math.random() - 0.5) * 4,
      speed: INITIAL_BALL_SPEED,
      trail: []
    };
    
    playerPaddleRef.current.y = COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    playerPaddleRef.current.score = 0;
    
    aiPaddleRef.current.y = COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    aiPaddleRef.current.score = 0;
    
    setPlayerScore(0);
    setAiScore(0);
    setRallyCount(0);
    setMaxRally(0);
  }, []);

  // 重置波
  const resetBall = useCallback((scorer: 'player' | 'ai') => {
    ballRef.current = {
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: scorer === 'player' ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
      vy: (Math.random() - 0.5) * 4,
      speed: INITIAL_BALL_SPEED,
      trail: []
    };
  }, []);

  // AI 邏輯
  const updateAI = useCallback((paddle: Paddle, ball: Ball) => {
    const difficultySettings = {
      easy: { speed: 3, reaction: 0.02, error: 50 },
      medium: { speed: 5, reaction: 0.05, error: 30 },
      hard: { speed: 8, reaction: 0.1, error: 15 }
    };
    
    const settings = difficultySettings[difficulty];
    const targetY = ball.y - paddle.height / 2 + (Math.random() - 0.5) * settings.error;
    
    // 平滑移動
    paddle.y += (targetY - paddle.y) * settings.reaction;
    
    // 限制速度
    const dy = targetY - paddle.y;
    if (Math.abs(dy) > settings.speed) {
      paddle.y += Math.sign(dy) * settings.speed;
    }
    
    // 邊界檢查
    paddle.y = Math.max(0, Math.min(COURT_HEIGHT - paddle.height, paddle.y));
  }, [difficulty]);

  // 物理更新
  const updatePhysics = useCallback(() => {
    const ball = ballRef.current;
    const player = playerPaddleRef.current;
    const ai = aiPaddleRef.current;
    
    // 更新波嘅拖尾
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 20) ball.trail.shift();
    
    // 應用重力
    ball.vy += GRAVITY;
    
    // 應用摩擦力
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;
    
    // 更新波位置
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // 限制速度
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > MAX_BALL_SPEED) {
      ball.vx = (ball.vx / speed) * MAX_BALL_SPEED;
      ball.vy = (ball.vy / speed) * MAX_BALL_SPEED;
    }
    
    // 上牆壁碰撞
    if (ball.y - BALL_SIZE / 2 < 0) {
      ball.y = BALL_SIZE / 2;
      ball.vy = -ball.vy * BOUNCE_DAMPING;
    }
    
    // 下牆壁碰撞
    if (ball.y + BALL_SIZE / 2 > COURT_HEIGHT) {
      ball.y = COURT_HEIGHT - BALL_SIZE / 2;
      ball.vy = -ball.vy * BOUNCE_DAMPING;
    }
    
    // 玩家球拍碰撞
    if (
      ball.x - BALL_SIZE / 2 < player.x + player.width &&
      ball.x + BALL_SIZE / 2 > player.x &&
      ball.y > player.y &&
      ball.y < player.y + player.height
    ) {
      // 計算碰撞點 (決定反彈角度)
      const hitPos = (ball.y - player.y) / player.height;
      const angle = (hitPos - 0.5) * Math.PI / 3; // ±60 度
      
      // 增加速度
      ball.speed = Math.min(ball.speed + 0.5, MAX_BALL_SPEED);
      
      ball.vx = Math.cos(angle) * ball.speed;
      ball.vy = Math.sin(angle) * ball.speed;
      ball.x = player.x + player.width + BALL_SIZE / 2;
      
      // 增加連擊數
      setRallyCount(prev => prev + 1);
    }
    
    // AI 球拍碰撞
    if (
      ball.x + BALL_SIZE / 2 > ai.x &&
      ball.x - BALL_SIZE / 2 < ai.x + ai.width &&
      ball.y > ai.y &&
      ball.y < ai.y + ai.height
    ) {
      const hitPos = (ball.y - ai.y) / ai.height;
      const angle = (hitPos - 0.5) * Math.PI / 3;
      
      ball.speed = Math.min(ball.speed + 0.5, MAX_BALL_SPEED);
      
      ball.vx = -Math.cos(angle) * ball.speed;
      ball.vy = Math.sin(angle) * ball.speed;
      ball.x = ai.x - BALL_SIZE / 2;
      
      setRallyCount(prev => prev + 1);
    }
    
    // 得分檢查
    if (ball.x < 0) {
      // AI 得分
      setAiScore(prev => {
        const newScore = prev + 1;
        if (newScore >= 11) {
          setGameState('gameover');
        }
        return newScore;
      });
      aiPaddleRef.current.score++;
      resetBall('ai');
      setRallyCount(prev => {
        if (prev > maxRally) setMaxRally(prev);
        return 0;
      });
    } else if (ball.x > COURT_WIDTH) {
      // 玩家得分
      setPlayerScore(prev => {
        const newScore = prev + 1;
        if (newScore >= 11) {
          setGameState('gameover');
        }
        return newScore;
      });
      playerPaddleRef.current.score++;
      resetBall('player');
      setRallyCount(prev => {
        if (prev > maxRally) setMaxRally(prev);
        return 0;
      });
    }
    
    // 更新玩家球拍 (鍵盤/滑鼠)
    if (useMouseRef.current) {
      player.y = mouseYRef.current - player.height / 2;
    } else {
      if (keysRef.current['w'] || keysRef.current['arrowup']) {
        player.y -= 8;
      }
      if (keysRef.current['s'] || keysRef.current['arrowdown']) {
        player.y += 8;
      }
    }
    
    // 玩家球拍邊界
    player.y = Math.max(0, Math.min(COURT_HEIGHT - player.height, player.y));
    
    // 更新 AI 球拍
    updateAI(ai, ball);
  }, [updateAI, maxRally, resetBall]);

  // 渲染遊戲
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const ball = ballRef.current;
    const player = playerPaddleRef.current;
    const ai = aiPaddleRef.current;
    
    // 清空畫布
    ctx.fillStyle = '#1a472a'; // 草地綠色
    ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);
    
    // 畫球場標記
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    // 中線
    ctx.beginPath();
    ctx.moveTo(COURT_WIDTH / 2, 0);
    ctx.lineTo(COURT_WIDTH / 2, COURT_HEIGHT);
    ctx.stroke();
    
    // 發球區
    ctx.strokeRect(50, 0, COURT_WIDTH / 2 - 50, COURT_HEIGHT / 2);
    ctx.strokeRect(50, COURT_HEIGHT / 2, COURT_WIDTH / 2 - 50, COURT_HEIGHT / 2);
    ctx.strokeRect(COURT_WIDTH / 2 + 50, 0, COURT_WIDTH / 2 - 50, COURT_HEIGHT / 2);
    ctx.strokeRect(COURT_WIDTH / 2 + 50, COURT_HEIGHT / 2, COURT_WIDTH / 2 - 50, COURT_HEIGHT / 2);
    
    // 畫網
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(COURT_WIDTH / 2 - NET_WIDTH / 2, COURT_HEIGHT / 2 - NET_HEIGHT / 2, NET_WIDTH, NET_HEIGHT);
    
    // 畫波嘅拖尾
    ball.trail.forEach((pos, index) => {
      const alpha = index / ball.trail.length * 0.5;
      const size = BALL_SIZE * (index / ball.trail.length);
      ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // 畫波
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 畫玩家球拍 (藍色)
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 畫玩家球拍邊框
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // 畫 AI 球拍 (紅色)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);
    
    // 畫 AI 球拍邊框
    ctx.strokeStyle = '#c0392b';
    ctx.strokeRect(ai.x, ai.y, ai.width, ai.height);
    
    // 畫計分板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Player: ${player.score}`, 20, 40);
    ctx.fillText(`AI: ${ai.score}`, 20, 70);
    
    // 畫連擊數
    if (rallyCount > 0) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`🔥 Rally: ${rallyCount}`, COURT_WIDTH - 150, 40);
    }
    
    // 畫最大連擊
    if (maxRally > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '16px Arial';
      ctx.fillText(`Max Rally: ${maxRally}`, COURT_WIDTH - 150, 65);
    }
    
    // 畫難度
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px Arial';
    ctx.fillText(`Difficulty: ${difficulty.toUpperCase()}`, COURT_WIDTH - 150, 90);
    
    // 畫控制提示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.fillText('W/S or Mouse to move', 10, COURT_HEIGHT - 10);
  }, [rallyCount, maxRally, difficulty]);

  // 遊戲循環
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    const gameLoop = () => {
      updatePhysics();
      render(ctx);
      animationId = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, updatePhysics, render]);

  // 鍵盤事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      useMouseRef.current = false;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 滑鼠事件
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = COURT_WIDTH / rect.width;
      const scaleY = COURT_HEIGHT / rect.height;
      
      mouseXRef.current = (e.clientX - rect.left) * scaleX;
      mouseYRef.current = (e.clientY - rect.top) * scaleY;
      useMouseRef.current = true;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 觸控事件 (手機支援)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = COURT_WIDTH / rect.width;
      const scaleY = COURT_HEIGHT / rect.height;
      
      mouseYRef.current = (touch.clientY - rect.top) * scaleY;
      useMouseRef.current = true;
    };
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // 開始遊戲
  const startGame = () => {
    initGame();
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏓 Pickleball Master Pro
          </h1>
          <p className="text-gray-300">
            高級匹克球對戰 - 同 AI 對決！
          </p>
        </div>

        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              🎮 遊戲選單
            </h2>
            
            {/* 難度選擇 */}
            <div className="mb-6">
              <label className="text-white text-lg block mb-3">選擇難度：</label>
              <div className="flex gap-4 justify-center">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      difficulty === diff
                        ? 'bg-purple-600 text-white scale-105 shadow-lg'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {diff === 'easy' && '🟢 簡單'}
                    {diff === 'medium' && '🟡 中等'}
                    {diff === 'hard' && '🔴 困難'}
                  </button>
                ))}
              </div>
            </div>

            {/* 遊戲說明 */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-bold mb-2">📖 遊戲說明：</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>🎯 用 <strong>W/S 鍵</strong> 或 <strong>滑鼠</strong> 控制球拍</li>
                <li>🏓 將波打向對手，讓對手接唔到</li>
                <li>🔥 連續接波可以賺取連擊分數</li>
                <li>📊 先攞到 11 分者勝</li>
                <li>💡 波會受重力影響，注意彈道！</li>
              </ul>
            </div>

            {/* 開始按鈕 */}
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 開始遊戲
            </button>
          </div>
        )}

        {/* Game Canvas */}
        {gameState === 'playing' && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={COURT_WIDTH}
              height={COURT_HEIGHT}
              className="w-full rounded-2xl border-4 border-purple-500/50 shadow-2xl cursor-none"
              style={{ maxHeight: '60vh', aspectRatio: `${COURT_WIDTH}/${COURT_HEIGHT}` }}
            />
            
            {/* Pause Button */}
            <button
              onClick={() => setGameState('paused')}
              className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              ⏸️ Pause
            </button>
          </div>
        )}

        {/* Paused */}
        {gameState === 'paused' && (
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-6">⏸️ 遊戲暫停</h2>
            
            <div className="flex gap-4">
              <button
                onClick={() => setGameState('playing')}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                ▶️ 繼續
              </button>
              
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                🏠 主選單
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'gameover' && (
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              {playerScore > aiScore ? '🏆 你贏啦！' : '😢 你輸咗...'}
            </h2>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="text-6xl font-bold text-white mb-2">
                {playerScore} - {aiScore}
              </div>
              <div className="text-gray-300">
                {playerScore > aiScore ? '恭喜！' : '再接再厲！'}
              </div>
            </div>
            
            {/* 統計 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{maxRally}</div>
                <div className="text-gray-300 text-sm">最大連擊</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{difficulty}</div>
                <div className="text-gray-300 text-sm">難度</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                🔄 再玩一次
              </button>
              
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                🏠 主選單
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>🎮 Pickleball Master Pro v2.0 | 物理引擎 + AI 對戰</p>
        </div>
      </div>
    </div>
  );
}
