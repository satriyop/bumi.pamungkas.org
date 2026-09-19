import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { 
  Crown, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  Users, 
  Undo2, 
  Award, 
  Zap, 
  Star
} from 'lucide-react';

interface ChessMasterArenaProps {
  isDarkMode: boolean;
  playSound: (sound: 'swim' | 'coin' | 'tech') => void;
}

// ==========================================
// PIECE EVALUATION TABLES FOR AI (MINIMAX)
// ==========================================
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Positional bonuses encouraging center control & active pieces
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

// ==========================================
// KNIGHT'S QUEST (PETUALANGAN KUDA CATUR)
// ==========================================
interface QuestLevel {
  level: number;
  title: string;
  desc: string;
  size: number; // grid size (e.g. 6 or 8)
  knightStart: [number, number]; // [row, col]
  stars: [number, number][]; // stars to collect
  obstacles: [number, number][]; // water/rock obstacles
  target: [number, number]; // goal square
  maxMoves: number;
  starThresholds: [number, number]; // [3-star max, 2-star max]
}

const QUEST_LEVELS: QuestLevel[] = [
  {
    level: 1,
    title: 'Langkah Pertama Kuda (Pola Huruf L)',
    desc: 'Lompatkan Kuda dengan pola huruf L (2 langkah lurus + 1 belok). Kumpulkan 2 bintang lalu mendarat di bendera!',
    size: 6,
    knightStart: [4, 1],
    stars: [[2, 2], [3, 4]],
    obstacles: [],
    target: [1, 3],
    maxMoves: 6,
    starThresholds: [3, 5]
  },
  {
    level: 2,
    title: 'Melompati Rintangan Danau',
    desc: 'Kuda catur adalah satu-satunya perwira yang bisa melompati rintangan! Lewati pusaran air dan ambil semua bintang!',
    size: 6,
    knightStart: [5, 0],
    stars: [[3, 1], [1, 2], [3, 4]],
    obstacles: [[4, 1], [4, 2], [3, 2], [2, 3]],
    target: [1, 5],
    maxMoves: 8,
    starThresholds: [4, 6]
  },
  {
    level: 3,
    title: 'Garpu Dua Bintang',
    desc: 'Bermanuverlah dengan lincah untuk meraih bintang di sudut-sudut papan dengan langkah paling efisien!',
    size: 6,
    knightStart: [5, 2],
    stars: [[1, 0], [1, 4], [4, 5]],
    obstacles: [[3, 1], [3, 3]],
    target: [0, 2],
    maxMoves: 9,
    starThresholds: [5, 7]
  },
  {
    level: 4,
    title: 'Labirin Batu Klaten',
    desc: 'Jalur sempit dan banyak rintangan batu! Hitung langkah Kuda beberapa langkah ke depan sebelum melompat.',
    size: 7,
    knightStart: [6, 1],
    stars: [[4, 2], [2, 3], [3, 5]],
    obstacles: [[5, 2], [5, 3], [4, 3], [2, 4], [3, 2]],
    target: [0, 5],
    maxMoves: 10,
    starThresholds: [6, 8]
  },
  {
    level: 5,
    title: 'Operasi Kuda Juara',
    desc: 'Kumpulkan 4 bintang yang tersebar di sekeliling papan. Uji ketajaman visualisasi langkah L Mas Bumi!',
    size: 7,
    knightStart: [6, 3],
    stars: [[4, 1], [2, 1], [2, 5], [4, 5]],
    obstacles: [[5, 3], [3, 3], [4, 3]],
    target: [0, 3],
    maxMoves: 12,
    starThresholds: [6, 9]
  },
  {
    level: 6,
    title: 'The Grandmaster Knight Challenge',
    desc: 'Tantangan puncak! Rintangan tersebar rapat, kumpulkan semua 5 bintang lalu kunci kemenangan di takhta raja!',
    size: 8,
    knightStart: [7, 1],
    stars: [[5, 2], [3, 3], [2, 5], [4, 6], [1, 4]],
    obstacles: [[6, 2], [5, 3], [4, 4], [3, 5], [5, 5]],
    target: [0, 6],
    maxMoves: 14,
    starThresholds: [8, 11]
  }
];

// ==========================================
// TACTICAL PUZZLES (TEKA-TEKI SKAKMAT)
// ==========================================
interface TacticalPuzzle {
  id: number;
  title: string;
  theme: string;
  instruction: string;
  hint: string;
  fen: string;
  solutionMove: { from: string; to: string; notation: string };
  explanation: string;
}

const TACTICAL_PUZZLES: TacticalPuzzle[] = [
  {
    id: 1,
    title: 'Skakmat 1 Langkah Ratu di f7 👑',
    theme: 'Mate in 1 (Scholar Finish)',
    instruction: 'Giliran Putih! Luncurkan Ratu untuk langsung mengeksekusi skakmat!',
    hint: 'Arahkan Ratu ke petak f7 di depan Raja hitam. Petak f7 dilindungi kuat oleh Gajah di c4!',
    fen: 'r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P1n1/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solutionMove: { from: 'f3', to: 'f7', notation: 'Qxf7#' },
    explanation: 'SKAKMAT SEMPURNA! Ratu putih mendarat di f7 dengan perlindungan Gajah c4. Raja hitam terkepung tanpa petak pelarian!'
  },
  {
    id: 2,
    title: 'Garpu Kuda Kerajaan (Royal Fork) ♞',
    theme: 'Garpu Kuda (Fork)',
    instruction: 'Giliran Putih! Lompatkan Kuda putih untuk menyerang Raja dan Ratu lawan sekaligus!',
    hint: 'Cari petak yang berjarak langkah L dari Raja hitam di e8 dan Ratu hitam di d8. Petak c7 kuncinya!',
    fen: 'r1bqk2r/pp1p1ppp/2n1p3/3nP3/3P4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 1',
    solutionMove: { from: 'c3', to: 'b5', notation: 'Nb5' },
    explanation: 'ANCAMAN MAUT! Kuda melompat dengan ancaman tak tertahan ke petak c7 untuk garpu ganda Raja dan Benteng!'
  },
  {
    id: 3,
    title: 'Skakmat Koridor Baris Belakang (Back-Rank) 🏰',
    theme: 'Back-Rank Mate',
    instruction: 'Giliran Putih! Luncurkan Benteng ke baris belakang Raja yang terkurung pionnya sendiri!',
    hint: 'Raja hitam terperangkap di baris 8 oleh pion f7, g7, h7. Luncurkan Benteng ke d8!',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solutionMove: { from: 'd1', to: 'd8', notation: 'Rxd8#' },
    explanation: 'SKAKMAT KORIDOR! Benteng menyapu habis baris ke-8. Dinding pion hitam sendiri menghalangi jalan lari Rajanya!'
  },
  {
    id: 4,
    title: 'Baterai Serangan Ratu & Gajah di g7 ⚡',
    theme: 'Battery Attack',
    instruction: 'Giliran Putih! Manfaatkan diagonal Gajah untuk menembus sayap Raja hitam di g7!',
    hint: 'Ratu di f6 menyerang petak g7 yang dijaga diagonal oleh Gajah putih di c3!',
    fen: '5rk1/ppp2ppp/5Q2/8/8/2B5/PPP2PPP/4R1K1 w - - 0 1',
    solutionMove: { from: 'f6', to: 'g7', notation: 'Qg7#' },
    explanation: 'SKAKMAT BATERAI LUAR BIASA! Ratu dan Gajah bekerja sama mengunci petak g7. Serangan tak terhentikan!'
  }
];

export const ChessMasterArena: React.FC<ChessMasterArenaProps> = ({ isDarkMode, playSound }) => {
  // Main Arena Tab: 'vs-ai' | 'pass-play' | 'knights-quest' | 'tactics'
  const [subTab, setSubTab] = useState<'vs-ai' | 'pass-play' | 'knights-quest' | 'tactics'>('vs-ai');

  // ==============================================================
  // CHESS GAME STATE (FOR VS-AI & PASS-PLAY)
  // ==============================================================
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [playerColor, setPlayerColor] = useState<Color>('w'); // user plays as white
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStatusText, setGameStatusText] = useState('Giliran Putih Melangkah ⚪');
  const [capturedPieces, setCapturedPieces] = useState<{ w: PieceSymbol[]; b: PieceSymbol[] }>({ w: [], b: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // Update captured pieces & status on game changes
  const updateGameStats = useCallback((chessInstance: Chess) => {
    // Calculate captured pieces
    const history = chessInstance.history({ verbose: true });
    const capW: PieceSymbol[] = [];
    const capB: PieceSymbol[] = [];
    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') capB.push(m.captured); // white captured black's piece
        else capW.push(m.captured); // black captured white's piece
      }
    });
    setCapturedPieces({ w: capW, b: capB });
    setMoveHistory(chessInstance.history());

    // Status text
    if (chessInstance.isCheckmate()) {
      const winner = chessInstance.turn() === 'w' ? 'Hitam' : 'Putih';
      setGameStatusText(`🏆 SKAKMAT! ${winner} Memenangkan Pertandingan!`);
    } else if (chessInstance.isDraw()) {
      setGameStatusText('🤝 Remis (Draw)! Pertandingan Berakhir Seimbang.');
    } else if (chessInstance.inCheck()) {
      const checkedColor = chessInstance.turn() === 'w' ? 'Putih' : 'Hitam';
      setGameStatusText(`⚠️ SKAK! Raja ${checkedColor} Terancam!`);
    } else {
      const turnName = chessInstance.turn() === 'w' ? 'Putih ⚪' : 'Hitam ⚫';
      setGameStatusText(`Giliran ${turnName} Melangkah`);
    }
  }, []);

  // AI Move Calculation (Minimax with Alpha-Beta)
  const calculateAiMove = useCallback((chessInstance: Chess, difficulty: 'easy' | 'medium' | 'hard'): Move | null => {
    const moves = chessInstance.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Easy: mostly random, captures if available
    if (difficulty === 'easy') {
      const captureMoves = moves.filter((m) => m.captured);
      if (captureMoves.length > 0 && Math.random() < 0.5) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Medium: 1-ply / simple evaluation
    if (difficulty === 'medium') {
      let bestMove = moves[0];
      let bestScore = -999999;
      for (const move of moves) {
        chessInstance.move(move);
        // Simple score: material captured + piece value + center control
        let score = 0;
        if (move.captured) score += PIECE_VALUES[move.captured] * 10;
        if (['d4', 'e4', 'd5', 'e5'].includes(move.to)) score += 30;
        if (chessInstance.inCheck()) score += 50;
        if (chessInstance.isCheckmate()) score += 10000;
        chessInstance.undo();

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    // Hard: Minimax depth 2 with alpha-beta + piece-square tables
    const evaluateBoard = (c: Chess, forColor: Color): number => {
      if (c.isCheckmate()) {
        return c.turn() === forColor ? -50000 : 50000;
      }
      if (c.isDraw()) return 0;

      let score = 0;
      const board = c.board();
      for (let r = 0; r < 8; r++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[r][col];
          if (!piece) continue;

          const val = PIECE_VALUES[piece.type];
          let posBonus = 0;
          const squareIdx = r * 8 + col;
          if (piece.type === 'p') posBonus = PAWN_TABLE[piece.color === 'w' ? squareIdx : 63 - squareIdx];
          else if (piece.type === 'n') posBonus = KNIGHT_TABLE[piece.color === 'w' ? squareIdx : 63 - squareIdx];
          else if (piece.type === 'b') posBonus = BISHOP_TABLE[piece.color === 'w' ? squareIdx : 63 - squareIdx];

          const totalPieceVal = val + posBonus;
          if (piece.color === forColor) score += totalPieceVal;
          else score -= totalPieceVal;
        }
      }
      return score;
    };

    const minimax = (c: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean, aiColor: Color): number => {
      if (depth === 0 || c.isGameOver()) {
        return evaluateBoard(c, aiColor);
      }

      const availableMoves = c.moves({ verbose: true });
      if (isMaximizing) {
        let maxEval = -999999;
        for (const m of availableMoves) {
          c.move(m);
          const evaluation = minimax(c, depth - 1, alpha, beta, false, aiColor);
          c.undo();
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = 999999;
        for (const m of availableMoves) {
          c.move(m);
          const evaluation = minimax(c, depth - 1, alpha, beta, true, aiColor);
          c.undo();
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    };

    const aiColor = chessInstance.turn();
    let bestMove: Move = moves[0];
    let bestVal = -999999;

    for (const move of moves) {
      chessInstance.move(move);
      const moveVal = minimax(chessInstance, 2, -999999, 999999, false, aiColor);
      chessInstance.undo();

      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = move;
      }
    }

    return bestMove;
  }, []);

  // Handle Square Click in vs-ai or pass-play
  const handleSquareClick = (square: Square) => {
    if (game.isGameOver()) return;
    if (subTab === 'vs-ai' && game.turn() !== playerColor) return; // wait for AI

    const pieceOnSquare = game.get(square);

    // If already selected a square, try to move
    if (selectedSquare) {
      // If clicked the same square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if move is legal
      const moveMatch = legalMoves.find((m) => m.to === square);
      if (moveMatch) {
        // Execute player move
        const newGame = new Chess(game.fen());
        const executedMove = newGame.move({
          from: selectedSquare,
          to: square,
          promotion: 'q'
        });

        if (executedMove) {
          if (executedMove.captured || newGame.inCheck() || newGame.isCheckmate()) {
            playSound('coin');
          } else {
            playSound('swim');
          }

          setGame(newGame);
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          updateGameStats(newGame);

          // If playing vs AI and game is not over, trigger AI
          if (subTab === 'vs-ai' && !newGame.isGameOver()) {
            setIsAiThinking(true);
            setTimeout(() => {
              const aiMove = calculateAiMove(newGame, aiDifficulty);
              if (aiMove) {
                newGame.move(aiMove);
                if (aiMove.captured || newGame.inCheck() || newGame.isCheckmate()) {
                  playSound('coin');
                } else {
                  playSound('swim');
                }
                setGame(new Chess(newGame.fen()));
                setLastMove({ from: aiMove.from as Square, to: aiMove.to as Square });
                updateGameStats(newGame);
              }
              setIsAiThinking(false);
            }, 550);
          }
        }
        return;
      }
    }

    // Otherwise, select piece if it matches the current turn's color
    if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
      if (subTab === 'vs-ai' && pieceOnSquare.color !== playerColor) return;
      playSound('tech');
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Reset / New Game
  const resetChessGame = () => {
    playSound('tech');
    const newG = new Chess();
    setGame(newG);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setIsAiThinking(false);
    updateGameStats(newG);
  };

  // Undo Move
  const undoMove = () => {
    playSound('tech');
    const newG = new Chess(game.fen());
    if (subTab === 'vs-ai') {
      newG.undo(); // Undo AI move
      newG.undo(); // Undo User move
    } else {
      newG.undo(); // Undo last player move
    }
    setGame(newG);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    updateGameStats(newG);
  };

  // Switch Side
  const switchPlayerColor = () => {
    playSound('tech');
    const newColor: Color = playerColor === 'w' ? 'b' : 'w';
    setPlayerColor(newColor);
    const newG = new Chess();
    setGame(newG);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    updateGameStats(newG);

    // If player switched to Black, AI moves first as White
    if (newColor === 'b') {
      setIsAiThinking(true);
      setTimeout(() => {
        const aiMove = calculateAiMove(newG, aiDifficulty);
        if (aiMove) {
          newG.move(aiMove);
          setGame(new Chess(newG.fen()));
          setLastMove({ from: aiMove.from as Square, to: aiMove.to as Square });
          updateGameStats(newG);
        }
        setIsAiThinking(false);
      }, 500);
    }
  };

  // Piece Unicode Symbol Helper
  const getPieceSymbol = (type: PieceSymbol, color: Color) => {
    const isWhite = color === 'w';
    switch (type) {
      case 'k': return isWhite ? '♔' : '♚';
      case 'q': return isWhite ? '♕' : '♛';
      case 'r': return isWhite ? '♖' : '♜';
      case 'b': return isWhite ? '♗' : '♝';
      case 'n': return isWhite ? '♘' : '♞';
      case 'p': return isWhite ? '♙' : '♟';
    }
  };

  // ==============================================================
  // KNIGHT'S QUEST STATE & LOGIC
  // ==============================================================
  const [questLevelIdx, setQuestLevelIdx] = useState(0);
  const currentQuest = QUEST_LEVELS[questLevelIdx];
  const [knightPos, setKnightPos] = useState<[number, number]>(currentQuest.knightStart);
  const [collectedStars, setCollectedStars] = useState<[number, number][]>([]);
  const [questMovesCount, setQuestMovesCount] = useState(0);
  const [isQuestWon, setIsQuestWon] = useState(false);

  // Sync quest when level changes
  useEffect(() => {
    setKnightPos(currentQuest.knightStart);
    setCollectedStars([]);
    setQuestMovesCount(0);
    setIsQuestWon(false);
  }, [questLevelIdx, currentQuest]);

  // Valid knight moves from current position
  const validKnightMoves = useMemo(() => {
    const [r, c] = knightPos;
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    const size = currentQuest.size;
    const moves: [number, number][] = [];

    for (const [dr, dc] of offsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        // Must not be an obstacle
        const isObstacle = currentQuest.obstacles.some(([or, oc]) => or === nr && oc === nc);
        if (!isObstacle) {
          moves.push([nr, nc]);
        }
      }
    }
    return moves;
  }, [knightPos, currentQuest]);

  const handleQuestSquareClick = (r: number, c: number) => {
    if (isQuestWon) return;

    // Check if clicked square is a valid L-move
    const isLegal = validKnightMoves.some(([vr, vc]) => vr === r && vc === c);
    if (!isLegal) {
      playSound('tech');
      return;
    }

    // Move knight
    setKnightPos([r, c]);
    const nextMoves = questMovesCount + 1;
    setQuestMovesCount(nextMoves);

    // Check if collected a star
    const hitStar = currentQuest.stars.find(
      ([sr, sc]) => sr === r && sc === c && !collectedStars.some(([cr, cc]) => cr === sr && cc === sc)
    );
    let newCollected = collectedStars;
    if (hitStar) {
      playSound('coin');
      newCollected = [...collectedStars, hitStar];
      setCollectedStars(newCollected);
    } else {
      playSound('swim');
    }

    // Check win condition: all stars collected AND on target square
    const allStarsGot = newCollected.length === currentQuest.stars.length;
    const onTarget = r === currentQuest.target[0] && c === currentQuest.target[1];

    if (allStarsGot && onTarget) {
      playSound('coin');
      setIsQuestWon(true);
    }
  };

  const resetQuest = () => {
    playSound('tech');
    setKnightPos(currentQuest.knightStart);
    setCollectedStars([]);
    setQuestMovesCount(0);
    setIsQuestWon(false);
  };

  const nextQuestLevel = () => {
    playSound('tech');
    setQuestLevelIdx((prev) => (prev + 1) % QUEST_LEVELS.length);
  };

  // ==============================================================
  // TACTICAL PUZZLE STATE & LOGIC
  // ==============================================================
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const currentPuzzle = TACTICAL_PUZZLES[puzzleIdx];
  const [puzzleGame, setPuzzleGame] = useState<Chess>(() => new Chess(currentPuzzle.fen));
  const [puzzleSelected, setPuzzleSelected] = useState<Square | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);
  const [puzzleFeedback, setPuzzleFeedback] = useState<string | null>(null);

  useEffect(() => {
    setPuzzleGame(new Chess(currentPuzzle.fen));
    setPuzzleSelected(null);
    setPuzzleSolved(false);
    setShowPuzzleHint(false);
    setPuzzleFeedback(null);
  }, [puzzleIdx, currentPuzzle]);

  const handlePuzzleSquareClick = (square: Square) => {
    if (puzzleSolved) return;

    if (puzzleSelected) {
      if (puzzleSelected === square) {
        setPuzzleSelected(null);
        return;
      }

      // Check if move matches solution
      if (puzzleSelected === currentPuzzle.solutionMove.from && square === currentPuzzle.solutionMove.to) {
        playSound('coin');
        const newG = new Chess(puzzleGame.fen());
        newG.move({ from: puzzleSelected, to: square, promotion: 'q' });
        setPuzzleGame(newG);
        setPuzzleSelected(null);
        setPuzzleSolved(true);
        setPuzzleFeedback(`Brilian! Langkah ${currentPuzzle.solutionMove.notation} Berhasil! 🏆`);
        return;
      } else {
        playSound('tech');
        setPuzzleFeedback('Langkah belum tepat! Coba analisa kembali atau gunakan petunjuk 💡');
        setPuzzleSelected(null);
        return;
      }
    }

    const piece = puzzleGame.get(square);
    if (piece && piece.color === puzzleGame.turn()) {
      playSound('tech');
      setPuzzleSelected(square);
    }
  };

  const resetPuzzle = () => {
    playSound('tech');
    setPuzzleGame(new Chess(currentPuzzle.fen));
    setPuzzleSelected(null);
    setPuzzleSolved(false);
    setShowPuzzleHint(false);
    setPuzzleFeedback(null);
  };

  const nextPuzzle = () => {
    playSound('tech');
    setPuzzleIdx((prev) => (prev + 1) % TACTICAL_PUZZLES.length);
  };

  // ==============================================================
  // RENDER
  // ==============================================================
  return (
    <div className={`rounded-3xl p-4 sm:p-7 border transition-all ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#0c0d24] via-[#141030] to-[#0a1224] border-purple-800/60 shadow-2xl' 
        : 'bg-gradient-to-br from-white via-purple-50/70 to-indigo-50/70 border-purple-200 shadow-xl'
    }`}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER & SUB-TABS */}
        <div className="text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-xs font-black font-mono-tech shadow-md">
              <Crown className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ARENA CATUR GRANDMASTER MAS BUMI</span>
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black font-fun tracking-tight">
            ♟️ Arena Catur & Asah Otak Juara
          </h3>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Latih intuisi strategi, visualisasi langkah kuda, dan kemampuan kalkulasi beberapa langkah ke depan!
          </p>

          {/* Sub-Mode Selector Buttons */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              onClick={() => {
                playSound('tech');
                setSubTab('vs-ai');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                subTab === 'vs-ai'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Tanding vs BumiBot AI 🤖</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setSubTab('pass-play');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                subTab === 'pass-play'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Mode 2 Pemain (Pass & Play) 👥</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setSubTab('knights-quest');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                subTab === 'knights-quest'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Petualangan Kuda (Knight's Quest) 🐎</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setSubTab('tactics');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                subTab === 'tactics'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Teka-Teki Skakmat ⚡</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUB-TAB 1 & 2: PLAYABLE CHESS MATCH (VS AI / PASS-PLAY)       */}
        {/* ============================================================== */}
        {(subTab === 'vs-ai' || subTab === 'pass-play') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Board */}
            <div className="lg:col-span-8 flex flex-col items-center">
              
              {/* Opponent Info Bar */}
              <div className="w-full max-w-[340px] sm:max-w-[420px] flex items-center justify-between py-2 px-3 rounded-t-2xl bg-slate-900/90 border-t border-x border-amber-900/60 font-mono-tech text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-300">
                    {subTab === 'vs-ai' ? <Bot className="w-4 h-4" /> : 'P2'}
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {subTab === 'vs-ai' ? `BumiBot AI (${aiDifficulty.toUpperCase()})` : 'Pemain 2 (Hitam)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isAiThinking ? 'Sedang berpikir... 🤔' : 'Menunggu giliran'}
                    </span>
                  </div>
                </div>

                {/* Captured White Pieces Tray */}
                <div className="flex items-center gap-0.5 text-base">
                  {capturedPieces.w.map((p, i) => (
                    <span key={i} className="text-white drop-shadow-sm select-none opacity-80">
                      {getPieceSymbol(p, 'w')}
                    </span>
                  ))}
                </div>
              </div>

              {/* 8x8 CHESS BOARD */}
              <div className="relative p-2.5 sm:p-3 bg-gradient-to-b from-[#382b1d] to-[#1f170f] border-x border-b border-amber-900/60 shadow-2xl inline-block select-none">
                <div className="grid grid-cols-8 grid-rows-8 w-[310px] h-[310px] sm:w-[390px] sm:h-[390px] rounded-lg overflow-hidden border border-amber-950">
                  {game.board().map((row, r) =>
                    row.map((piece, c) => {
                      const squareName = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
                      const isDark = (r + c) % 2 === 1;
                      const isSelected = selectedSquare === squareName;
                      const isLegalMove = legalMoves.some((m) => m.to === squareName);
                      const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
                      const isKingInCheck = game.inCheck() && piece && piece.type === 'k' && piece.color === game.turn();

                      return (
                        <button
                          key={squareName}
                          onClick={() => handleSquareClick(squareName)}
                          className={`relative flex items-center justify-center text-3xl sm:text-4xl transition-all cursor-pointer ${
                            isDark 
                              ? 'bg-[#739552] hover:bg-[#688849]' 
                              : 'bg-[#ebecd0] hover:bg-[#dfe1c1]'
                          } ${
                            isLastMoveSquare ? 'bg-amber-200/80 dark:bg-amber-600/50' : ''
                          } ${
                            isSelected ? 'ring-4 ring-inset ring-amber-400 bg-amber-300/80 z-10' : ''
                          } ${
                            isKingInCheck ? 'ring-4 ring-inset ring-rose-500 bg-rose-500/50 animate-pulse z-10' : ''
                          }`}
                          title={`Petak ${squareName}`}
                        >
                          {/* Rank Labels on Left */}
                          {c === 0 && (
                            <span className={`absolute top-0.5 left-1 text-[9px] font-black font-mono-tech pointer-events-none opacity-60 ${
                              isDark ? 'text-white' : 'text-slate-800'
                            }`}>
                              {8 - r}
                            </span>
                          )}

                          {/* File Labels on Bottom */}
                          {r === 7 && (
                            <span className={`absolute bottom-0.5 right-1 text-[9px] font-black font-mono-tech pointer-events-none opacity-60 ${
                              isDark ? 'text-white' : 'text-slate-800'
                            }`}>
                              {String.fromCharCode(97 + c)}
                            </span>
                          )}

                          {/* Legal Move Indicator Dot */}
                          {isLegalMove && (
                            <span className={`absolute rounded-full pointer-events-none z-10 ${
                              piece 
                                ? 'w-full h-full ring-4 ring-inset ring-rose-500/80 bg-rose-500/20' 
                                : 'w-3 h-3 sm:w-4 sm:h-4 bg-slate-950/30 dark:bg-white/40 shadow-sm'
                            }`} />
                          )}

                          {/* Piece Display */}
                          {piece && (
                            <span className={`transform transition-transform duration-150 hover:scale-110 select-none ${
                              piece.color === 'w'
                                ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                                : 'text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]'
                            }`}>
                              {getPieceSymbol(piece.type, piece.color)}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Player Info Bar */}
              <div className="w-full max-w-[340px] sm:max-w-[420px] flex items-center justify-between py-2 px-3 rounded-b-2xl bg-slate-900/90 border-b border-x border-amber-900/60 font-mono-tech text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-300">
                    🏆
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {subTab === 'vs-ai' ? 'Mas Bumi (Putih)' : 'Pemain 1 (Putih)'}
                    </span>
                    <span className="text-[10px] text-cyan-400">
                      {game.turn() === playerColor ? 'Giliran Anda!' : 'Menunggu lawan'}
                    </span>
                  </div>
                </div>

                {/* Captured Black Pieces Tray */}
                <div className="flex items-center gap-0.5 text-base">
                  {capturedPieces.b.map((p, i) => (
                    <span key={i} className="text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] select-none opacity-90">
                      {getPieceSymbol(p, 'b')}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Game Control Panel */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Status Display Card */}
              <div className={`p-4 rounded-2xl border text-center font-mono-tech space-y-2 ${
                game.isCheckmate()
                  ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-400/80 text-emerald-300'
                  : game.inCheck()
                    ? 'bg-rose-950/50 border-rose-500/70 text-rose-300'
                    : isDarkMode
                      ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status Pertandingan</span>
                <p className="font-black text-sm sm:text-base">{gameStatusText}</p>
              </div>

              {/* AI Difficulty Selector (if vs-ai) */}
              {subTab === 'vs-ai' && (
                <div className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <span className="text-xs font-bold text-slate-400 font-mono-tech block">Tingkat Kesulitan AI:</span>
                  <div className="grid grid-cols-3 gap-1.5 font-mono-tech text-xs">
                    {[
                      { key: 'easy', label: '🟢 Santai' },
                      { key: 'medium', label: '🟡 Menengah' },
                      { key: 'hard', label: '🔴 Master' }
                    ].map((d) => (
                      <button
                        key={d.key}
                        onClick={() => {
                          playSound('tech');
                          setAiDifficulty(d.key as any);
                        }}
                        className={`py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer ${
                          aiDifficulty === d.key
                            ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 font-mono-tech text-xs">
                <button
                  onClick={undoMove}
                  disabled={moveHistory.length === 0 || isAiThinking}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Tarik Langkah</span>
                </button>

                <button
                  onClick={resetChessGame}
                  className="p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-500 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Main Ulang</span>
                </button>

                {subTab === 'vs-ai' && (
                  <button
                    onClick={switchPlayerColor}
                    disabled={isAiThinking}
                    className="col-span-2 p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
                  >
                    <span>🔄 Tukar Sisi ({playerColor === 'w' ? 'Bermain Putih ⚪' : 'Bermain Hitam ⚫'})</span>
                  </button>
                )}
              </div>

              {/* Move History */}
              <div className={`p-3.5 rounded-2xl border font-mono-tech text-xs space-y-2 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>RIWAYAT LANGKAH:</span>
                  <span>{moveHistory.length} Langkah</span>
                </div>
                <div className="max-h-28 overflow-y-auto pr-1 text-[11px] text-slate-300 space-y-1">
                  {moveHistory.length === 0 ? (
                    <span className="text-slate-500 italic block text-center py-2">Belum ada langkah</span>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      {moveHistory.map((m, idx) => (
                        <span key={idx} className="truncate">
                          {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                          <strong className="text-cyan-400">{m}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* SUB-TAB 3: KNIGHT'S QUEST (PETUALANGAN KUDA CATUR)            */}
        {/* ============================================================== */}
        {subTab === 'knights-quest' && (
          <div className="max-w-2xl mx-auto space-y-5">
            
            {/* Level Info Banner */}
            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Level {currentQuest.level} dari {QUEST_LEVELS.length}
                </span>
                <span className="font-bold text-slate-400">
                  Langkah: <strong className="text-white text-sm">{questMovesCount}</strong> (Maks: {currentQuest.maxMoves})
                </span>
              </div>
              <h4 className="font-black text-lg sm:text-xl font-fun text-amber-300">
                {currentQuest.title}
              </h4>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentQuest.desc}
              </p>
            </div>

            {/* Quest Grid */}
            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-gradient-to-b from-[#2e2316] to-[#18120b] border-2 border-amber-800/80 shadow-2xl inline-block select-none">
                <div 
                  className="grid gap-1 rounded-lg overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${currentQuest.size}, minmax(0, 1fr))`,
                    width: currentQuest.size * 46,
                    height: currentQuest.size * 46
                  }}
                >
                  {Array.from({ length: currentQuest.size }).map((_, r) =>
                    Array.from({ length: currentQuest.size }).map((_, c) => {
                      const isKnight = knightPos[0] === r && knightPos[1] === c;
                      const isStar = currentQuest.stars.some(([sr, sc]) => sr === r && sc === c);
                      const isCollectedStar = collectedStars.some(([sr, sc]) => sr === r && sc === c);
                      const isObstacle = currentQuest.obstacles.some(([or, oc]) => or === r && oc === c);
                      const isTarget = currentQuest.target[0] === r && currentQuest.target[1] === c;
                      const isLegalMove = validKnightMoves.some(([vr, vc]) => vr === r && vc === c);
                      const isDark = (r + c) % 2 === 1;

                      return (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => handleQuestSquareClick(r, c)}
                          disabled={isObstacle}
                          className={`relative flex items-center justify-center rounded-lg text-2xl transition-all cursor-pointer ${
                            isObstacle
                              ? 'bg-blue-950/80 border border-blue-600/40 text-blue-400 cursor-not-allowed'
                              : isDark
                                ? 'bg-[#739552] hover:bg-[#688849]'
                                : 'bg-[#ebecd0] hover:bg-[#dfe1c1]'
                          } ${
                            isLegalMove ? 'ring-2 ring-amber-400 bg-amber-400/30' : ''
                          }`}
                        >
                          {/* Obstacle Water / Whirlpool */}
                          {isObstacle && <span className="text-lg">🌊</span>}

                          {/* Target Flag / Castle */}
                          {isTarget && !isKnight && <span className="text-xl">🚩</span>}

                          {/* Star to collect */}
                          {isStar && !isCollectedStar && !isKnight && (
                            <span className="text-xl animate-bounce">⭐</span>
                          )}

                          {/* Collected star shadow */}
                          {isStar && isCollectedStar && !isKnight && (
                            <span className="text-xs opacity-20">⭐</span>
                          )}

                          {/* Knight Piece */}
                          {isKnight && (
                            <span className="text-3xl text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse">
                              ♞
                            </span>
                          )}

                          {/* Move hint dot */}
                          {isLegalMove && !isKnight && (
                            <span className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs pointer-events-none" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Win Celebration Banner */}
            {isQuestWon && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/90 to-slate-900 border-2 border-emerald-400 text-center space-y-3 animate-float max-w-md mx-auto shadow-2xl">
                <span className="text-4xl block">🎉🏆⭐</span>
                <h4 className="text-xl font-black font-fun text-emerald-300">
                  Level {currentQuest.level} Berhasil Ditaklukkan!
                </h4>
                <p className="text-xs text-slate-200">
                  Mas Bumi berhasil menyelesaikan teka-teki dalam <strong>{questMovesCount} langkah</strong>!
                </p>
                <div className="flex justify-center gap-1 text-2xl text-amber-400">
                  <Star className="fill-amber-400 w-6 h-6" />
                  <Star className={`w-6 h-6 ${questMovesCount <= currentQuest.starThresholds[1] ? 'fill-amber-400' : 'opacity-30'}`} />
                  <Star className={`w-6 h-6 ${questMovesCount <= currentQuest.starThresholds[0] ? 'fill-amber-400' : 'opacity-30'}`} />
                </div>
                <button
                  onClick={nextQuestLevel}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 cursor-pointer mt-2"
                >
                  Lanjut ke Level Berikutnya ➡️
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-3 font-mono-tech text-xs">
              <button
                onClick={resetQuest}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulang Level</span>
              </button>

              <button
                onClick={nextQuestLevel}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <span>Level Lain ➡️</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* SUB-TAB 4: TACTICS PUZZLE TRAINER                             */}
        {/* ============================================================== */}
        {subTab === 'tactics' && (
          <div className="max-w-2xl mx-auto space-y-5">
            
            {/* Puzzle Header */}
            <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-purple-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                  {currentPuzzle.theme}
                </span>
                <span className="text-slate-400 font-bold">
                  Teka-teki {puzzleIdx + 1} dari {TACTICAL_PUZZLES.length}
                </span>
              </div>
              <h4 className="font-black text-xl font-fun text-purple-300">
                {currentPuzzle.title}
              </h4>
              <p className="text-xs sm:text-sm font-bold text-cyan-300">
                🎯 {currentPuzzle.instruction}
              </p>
            </div>

            {/* 8x8 Puzzle Board */}
            <div className="flex justify-center select-none">
              <div className="p-3 bg-gradient-to-b from-[#382b1d] to-[#1f170f] border-2 border-amber-800/80 shadow-2xl rounded-2xl inline-block">
                <div className="grid grid-cols-8 grid-rows-8 w-[310px] h-[310px] sm:w-[380px] sm:h-[380px] rounded-lg overflow-hidden border border-amber-950">
                  {puzzleGame.board().map((row, r) =>
                    row.map((piece, c) => {
                      const squareName = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
                      const isDark = (r + c) % 2 === 1;
                      const isSelected = puzzleSelected === squareName;
                      const isHint = showPuzzleHint && (
                        currentPuzzle.solutionMove.from === squareName || 
                        currentPuzzle.solutionMove.to === squareName
                      );

                      return (
                        <button
                          key={squareName}
                          onClick={() => handlePuzzleSquareClick(squareName)}
                          className={`relative flex items-center justify-center text-3xl sm:text-4xl transition-all cursor-pointer ${
                            isDark 
                              ? 'bg-[#739552] hover:bg-[#688849]' 
                              : 'bg-[#ebecd0] hover:bg-[#dfe1c1]'
                          } ${
                            isSelected ? 'ring-4 ring-inset ring-amber-400 bg-amber-300/80 z-10' : ''
                          } ${
                            isHint ? 'ring-4 ring-inset ring-cyan-400 bg-cyan-400/40 animate-pulse z-10' : ''
                          }`}
                        >
                          {c === 0 && (
                            <span className={`absolute top-0.5 left-1 text-[9px] font-black font-mono-tech pointer-events-none opacity-60 ${
                              isDark ? 'text-white' : 'text-slate-800'
                            }`}>
                              {8 - r}
                            </span>
                          )}
                          {r === 7 && (
                            <span className={`absolute bottom-0.5 right-1 text-[9px] font-black font-mono-tech pointer-events-none opacity-60 ${
                              isDark ? 'text-white' : 'text-slate-800'
                            }`}>
                              {String.fromCharCode(97 + c)}
                            </span>
                          )}

                          {piece && (
                            <span className={`transform transition-transform select-none ${
                              piece.color === 'w'
                                ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                                : 'text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]'
                            }`}>
                              {getPieceSymbol(piece.type, piece.color)}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Hint Box */}
            {showPuzzleHint && !puzzleSolved && (
              <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-center space-y-1 max-w-md mx-auto">
                <span className="text-xs font-mono-tech text-cyan-300 font-bold block">💡 PETUNJUK:</span>
                <p className="text-xs text-cyan-200">{currentPuzzle.hint}</p>
              </div>
            )}

            {/* Feedback Box */}
            {puzzleFeedback && !puzzleSolved && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-300 text-center text-xs font-bold font-mono-tech max-w-md mx-auto">
                {puzzleFeedback}
              </div>
            )}

            {/* Solved Banner */}
            {puzzleSolved && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/90 to-slate-900 border-2 border-emerald-400 text-center space-y-3 animate-float max-w-md mx-auto shadow-2xl">
                <span className="text-4xl block animate-bounce">🏆🎉</span>
                <h4 className="text-xl font-black font-fun text-emerald-300">
                  TAKTIK SKAKMAT BERHASIL!
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentPuzzle.explanation}
                </p>
                <button
                  onClick={nextPuzzle}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 cursor-pointer mt-2"
                >
                  Lanjut Teka-teki Berikutnya ➡️
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-3 font-mono-tech text-xs">
              <button
                onClick={() => {
                  playSound('tech');
                  setShowPuzzleHint((p) => !p);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showPuzzleHint ? 'Tutup Petunjuk' : 'Beri Petunjuk 💡'}</span>
              </button>

              <button
                onClick={resetPuzzle}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulang Posisi</span>
              </button>

              <button
                onClick={nextPuzzle}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/30 transition-all cursor-pointer"
              >
                <span>Teka-teki Lain ➡️</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
