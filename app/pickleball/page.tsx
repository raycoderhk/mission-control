'use client';

import { useState } from 'react';

export default function PickleballGame() {
  const [gameState, setGameState] = useState({
    playerName: '',
    score: 0,
    level: 1,
    streak: 0,
    gamesPlayed: 0,
    title: '🌱 新手'
  });

  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'game' | 'quiz' | 'reflex' | 'serve'>('welcome');
  const [quizState, setQuizState] = useState({ currentQuestion: 0, score: 0, questions: [] as any[] });
  const [reflexState, setReflexState] = useState({ waiting: false, startTime: 0, result: '' });
  const [feedback, setFeedback] = useState('');

  const levels = [
    { level: 1, title: "🌱 新手", minScore: 0 },
    { level: 2, title: "🎾 初學者", minScore: 20 },
    { level: 3, title: "🎯 中級玩家", minScore: 40 },
    { level: 4, title: "⭐ 高級玩家", minScore: 70 },
    { level: 5, title: "🏆 匹克球大師", minScore: 100 }
  ];

  const questions = [
    { q: "匹克球嘅英文係咩？", options: ["A) Tennis", "B) Pickleball", "C) Badminton", "D) Squash"], answer: 1, points: 10 },
    { q: "一個標準匹克球場有幾呎長？", options: ["A) 20 呎", "B) 30 呎", "C) 44 呎", "D) 60 呎"], answer: 2, points: 15 },
    { q: "匹克球比賽通常係幾分制？", options: ["A) 11 分", "B) 15 分", "C) 21 分", "D) 25 分"], answer: 0, points: 10 },
    { q: "\"Kitchen\" 在匹克球中指的是什麼？", options: ["A) 休息區", "B) 發球區", "C) 非截擊區", "D) 觀眾區"], answer: 2, points: 15 },
    { q: "匹克球拍通常用咩材料做？", options: ["A) 木", "B) 金屬", "C) 複合材料", "D) 塑料"], answer: 2, points: 10 },
    { q: "雙打比賽有幾多人參與？", options: ["A) 2 人", "B) 3 人", "C) 4 人", "D) 6 人"], answer: 2, points: 5 },
  ];

  const updateLevel = (score: number) => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (score >= levels[i].minScore) {
        return { level: levels[i].level, title: levels[i].title };
      }
    }
    return { level: 1, title: '🌱 新手' };
  };

  const startQuiz = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 3);
    setQuizState({ currentQuestion: 0, score: 0, questions: shuffled });
    setCurrentScreen('quiz');
  };

  const answerQuestion = (index: number) => {
    const q = quizState.questions[quizState.currentQuestion];
    const isCorrect = index === q.answer;
    
    if (isCorrect) {
      const points = q.points + (gameState.streak >= 3 ? 5 : 0);
      const newScore = gameState.score + points;
      const newStreak = gameState.streak + 1;
      const levelInfo = updateLevel(newScore);
      
      setGameState({
        ...gameState,
        score: newScore,
        streak: newStreak,
        ...levelInfo
      });
      
      setFeedback(`✅ 正確！${points} 分 ${gameState.streak >= 3 ? '(🔥 連勝獎勵 +5!)' : ''}`);
    } else {
      setGameState({ ...gameState, streak: 0 });
      setFeedback(`❌ 錯誤！正確答案係 ${q.options[q.answer]}`);
    }

    setTimeout(() => {
      setFeedback('');
      if (quizState.currentQuestion >= 2) {
        setGameState(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
        setCurrentScreen('game');
      } else {
        setQuizState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
      }
    }, 1500);
  };

  const startReflex = () => {
    setCurrentScreen('reflex');
    setReflexState({ waiting: false, startTime: 0, result: '' });
  };

  const reflexClick = () => {
    if (!reflexState.waiting && !reflexState.startTime) {
      setReflexState(prev => ({ ...prev, waiting: true }));
      const delay = Math.random() * 3000 + 2000;
      setTimeout(() => {
        setReflexState(prev => ({ ...prev, waiting: false, startTime: Date.now() }));
      }, delay);
    } else if (reflexState.waiting) {
      setReflexState({ waiting: false, startTime: 0, result: '太快啦！再試一次 🏓' });
    } else {
      const reaction = (Date.now() - reflexState.startTime) / 1000;
      let points = 5, msg = '💪 繼續練習！';
      
      if (reaction < 0.2) { points = 30; msg = '🏆 世界級反應！'; }
      else if (reaction < 0.3) { points = 20; msg = '⭐ 非常好！'; }
      else if (reaction < 0.4) { points = 15; msg = '👍 不錯！'; }
      else if (reaction < 0.5) { points = 10; msg = '🙂 平均'; }
      
      const newScore = gameState.score + points;
      const levelInfo = updateLevel(newScore);
      
      setGameState({
        ...gameState,
        score: newScore,
        gamesPlayed: gameState.gamesPlayed + 1,
        ...levelInfo
      });
      
      setReflexState({ 
        waiting: false, 
        startTime: 0, 
        result: `${reaction.toFixed(3)} 秒 - ${msg} +${points}分！` 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">🏓 Pickleball Master</h1>
          <p className="text-xl opacity-90">匹克球挑戰遊戲</p>
        </div>

        {/* Welcome Screen */}
        {currentScreen === 'welcome' && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-purple-600 mb-4">歡迎來到匹克球挑戰！🎉</h2>
              <p className="text-gray-600 mb-6 text-lg">通過各種挑戰提升你的等級，成為匹克球大師！</p>
              
              <input
                type="text"
                placeholder="請輸入你的名字"
                className="w-full max-w-md px-6 py-4 text-xl border-2 border-purple-600 rounded-xl mb-6 text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={gameState.playerName}
                onChange={(e) => setGameState({ ...gameState, playerName: e.target.value })}
                maxLength={20}
              />
              
              <button
                onClick={() => setCurrentScreen('game')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:transform hover:scale-105 transition-all shadow-lg"
              >
                開始遊戲 🚀
              </button>
            </div>
          </div>
        )}

        {/* Game Menu */}
        {currentScreen === 'game' && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {/* Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-xl text-center">
                <div className="text-sm opacity-90 mb-1">玩家</div>
                <div className="text-2xl font-bold">{gameState.playerName || '-'}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-xl text-center">
                <div className="text-sm opacity-90 mb-1">等級</div>
                <div className="text-2xl font-bold">Lv.{gameState.level}</div>
                <div className="text-xs mt-1">{gameState.title}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-xl text-center">
                <div className="text-sm opacity-90 mb-1">積分</div>
                <div className="text-2xl font-bold">{gameState.score}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-xl text-center">
                <div className="text-sm opacity-90 mb-1">連勝</div>
                <div className="text-2xl font-bold">{gameState.streak}</div>
              </div>
            </div>

            {/* Menu Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={startQuiz}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl text-lg font-semibold hover:transform hover:scale-105 transition-all shadow-lg"
              >
                📝 知識挑戰
              </button>
              <button
                onClick={startReflex}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl text-lg font-semibold hover:transform hover:scale-105 transition-all shadow-lg"
              >
                ⚡ 反應挑戰
              </button>
              <button
                onClick={() => {
                  setGameState(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
                  setCurrentScreen('welcome');
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-xl text-lg font-semibold hover:transform hover:scale-105 transition-all shadow-lg"
              >
                🚪 退出遊戲
              </button>
            </div>

            {/* Progress */}
            <div className="bg-gray-100 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-700 mb-3">🎯 下一目標</h3>
              <p className="text-gray-600 mb-3">
                再得 <span className="font-bold text-purple-600">
                  {Math.max(0, levels[gameState.level]?.minScore - gameState.score || 0)}
                </span> 分就可以升級！
              </p>
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (gameState.score / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Screen */}
        {currentScreen === 'quiz' && quizState.questions.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <div className="w-full bg-gray-300 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${((quizState.currentQuestion + 1) / 3) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-600">問題 {quizState.currentQuestion + 1}/3</p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-xl mb-6">
              <p className="text-xl font-semibold text-gray-800">{quizState.questions[quizState.currentQuestion].q}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {quizState.questions[quizState.currentQuestion].options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => answerQuestion(i)}
                  className="bg-white border-2 border-purple-600 text-purple-600 p-4 rounded-xl text-lg font-semibold hover:bg-purple-600 hover:text-white transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback && (
              <div className={`p-4 rounded-xl text-center text-lg font-bold ${
                feedback.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback}
              </div>
            )}
          </div>
        )}

        {/* Reflex Screen */}
        {currentScreen === 'reflex' && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">⚡ 反應挑戰</h2>
            <p className="text-gray-600 mb-6 text-lg">當見到「🏓」時，立即按下面個按鈕！</p>
            
            <div className={`text-9xl mb-8 ${reflexState.startTime ? 'block' : 'hidden'}`}>
              🏓
            </div>
            
            <button
              onClick={reflexClick}
              disabled={reflexState.waiting}
              className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-xl text-2xl font-semibold transition-all shadow-lg ${
                reflexState.waiting ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105'
              }`}
            >
              {reflexState.waiting ? '等待中...' : reflexState.startTime ? '按我！🏓' : '準備好未？按我開始！'}
            </button>
            
            {reflexState.result && (
              <div className="mt-8 p-6 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">{reflexState.result}</p>
                <button
                  onClick={startReflex}
                  className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all"
                >
                  再玩一次 🔄
                </button>
              </div>
            )}
            
            <button
              onClick={() => setCurrentScreen('game')}
              className="mt-4 text-gray-600 hover:text-purple-600 transition-all"
            >
              ← 返回選單
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
