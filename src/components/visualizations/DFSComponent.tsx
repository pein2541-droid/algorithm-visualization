import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/useStore';

// ---- Types ----

interface CellWalls {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

interface MazeCell {
  row: number;
  col: number;
  walls: CellWalls;
  visited: boolean;
}

interface MazePos {
  row: number;
  col: number;
}

interface StepInfo {
  visited: string[];
  stack: string[];
  currentCell: string | null;
  neighborCell: string | null;
  action: 'start' | 'push' | 'pop' | 'check' | 'found' | 'finish';
  description: string;
  codeLine: number;
  finalPath?: string[];
}

interface DFSComponentProps {
  pseudocode: string[];
}

// ---- Constants ----

const ROWS = 8;
const COLS = 10;
const CELL_SIZE = 40;

// ---- Helpers ----

function posKey(row: number, col: number): string {
  return row + "," + col;
}

function parseKey(key: string): MazePos {
  const [r, c] = key.split(",").map(Number);
  return { row: r, col: c };
}

function canMove(maze: CellWalls[][], rows: number, cols: number, r: number, c: number, dr: number, dc: number): boolean {
  if (r + dr < 0 || r + dr >= rows || c + dc < 0 || c + dc >= cols) return false;
  const walls = maze[r][c];
  if (dr === -1 && dc === 0) return !walls.top;
  if (dr === 1 && dc === 0) return !walls.bottom;
  if (dr === 0 && dc === -1) return !walls.left;
  if (dr === 0 && dc === 1) return !walls.right;
  return false;
}

// ---- Prim'''s algorithm Maze Generation — winding mazes with many branches ----

function generateMaze(rows: number, cols: number): CellWalls[][] {
  // Initialize grid with all walls up
  const grid: MazeCell[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        row: r, col: c,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false
      };
    }
  }

  const directions = [
    { dr: -1, dc: 0, wall: 'top' as const, opposite: 'bottom' as const },
    { dr: 1, dc: 0, wall: 'bottom' as const, opposite: 'top' as const },
    { dr: 0, dc: -1, wall: 'left' as const, opposite: 'right' as const },
    { dr: 0, dc: 1, wall: 'right' as const, opposite: 'left' as const },
  ];

  // Prim'''s algorithm: start with random cell
  const startR = Math.floor(Math.random() * rows);
  const startC = Math.floor(Math.random() * cols);
  grid[startR][startC].visited = true;

  type WallEntry = { r: number; c: number; nr: number; nc: number; wall: keyof CellWalls; opposite: keyof CellWalls };
  const walls: WallEntry[] = [];

  // Add walls of starting cell
  for (const d of directions) {
    const nr = startR + d.dr;
    const nc = startC + d.dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      walls.push({ r: startR, c: startC, nr, nc, wall: d.wall, opposite: d.opposite });
    }
  }

  while (walls.length > 0) {
    // Pick random wall (Prim'''s — creates winding paths)
    const idx = Math.floor(Math.random() * walls.length);
    const w = walls[idx];
    walls.splice(idx, 1);

    if (!grid[w.nr][w.nc].visited) {
      // Carve passage
      grid[w.r][w.c].walls[w.wall] = false;
      grid[w.nr][w.nc].walls[w.opposite] = false;
      grid[w.nr][w.nc].visited = true;

      // Add new cell'''s walls
      for (const d of directions) {
        const nnr = w.nr + d.dr;
        const nnc = w.nc + d.dc;
        if (nnr >= 0 && nnr < rows && nnc >= 0 && nnc < cols && !grid[nnr][nnc].visited) {
          walls.push({ r: w.nr, c: w.nc, nr: nnr, nc: nnc, wall: d.wall, opposite: d.opposite });
        }
      }
    }
  }

  // Post-process: randomly remove ~3% of interior walls to create loops
  const extraOpenings = Math.floor(rows * cols * 0.03);
  for (let i = 0; i < extraOpenings; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const d = directions[Math.floor(Math.random() * 4)];
    const nr = r + d.dr;
    const nc = c + d.dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[r][c].walls[d.wall]) {
      grid[r][c].walls[d.wall] = false;
      grid[nr][nc].walls[d.opposite] = false;
    }
  }

  return grid.map(row => row.map(cell => cell.walls));
}

// ---- DFS Maze Solving (Iterative Stack) ----

function solveDFS(maze: CellWalls[][], rows: number, cols: number): StepInfo[] {
  const history: StepInfo[] = [];
  const visited = new Set<string>();
  const stack: string[] = [];
  const parent = new Map<string, string | null>();

  const start = posKey(0, 0);
  const end = posKey(rows - 1, cols - 1);
  const directions = [
    { dr: -1, dc: 0, name: '上' },
    { dr: 1, dc: 0, name: '下' },
    { dr: 0, dc: -1, name: '左' },
    { dr: 0, dc: 1, name: '右' },
  ];

  // Initialize
  stack.push(start);
  visited.add(start);
  parent.set(start, null);

  history.push({
    visited: [],
    stack: [...stack],
    currentCell: start,
    neighborCell: null,
    action: 'push',
    description: '初始化：起点 (0,0) 入栈并记忆',
    codeLine: 1
  });

  let found = false;

  while (stack.length > 0 && !found) {
    // Pop from top (LIFO!)
    const current = stack.pop()!;
    const cur = parseKey(current);

    history.push({
      visited: Array.from(visited),
      stack: [...stack],
      currentCell: current,
      neighborCell: null,
      action: 'pop',
      description: '出栈：Pop 栈顶 (' + cur.row + ',' + cur.col + ') — 后进先出！',
      codeLine: 4
    });

    // Check if reached end
    if (current === end) {
      const path: string[] = [];
      let node: string | null = end;
      while (node !== null) {
        path.unshift(node);
        node = parent.get(node) ?? null;
      }

      history.push({
        visited: Array.from(visited),
        stack: [...stack],
        currentCell: current,
        neighborCell: null,
        action: 'found',
        description: '找到终点！路径长度: ' + (path.length - 1) + ' 步（注意：DFS 不一定是最短路径）',
        codeLine: 4,
        finalPath: path
      });
      found = true;
      break;
    }

    // Check all 4 directions
    for (const { dr, dc, name } of directions) {
      const nr = cur.row + dr;
      const nc = cur.col + dc;
      const nKey = posKey(nr, nc);

      // Out of bounds?
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        history.push({
          visited: Array.from(visited),
          stack: [...stack],
          currentCell: current,
          neighborCell: null,
          action: 'check',
          description: '向' + name + '走 (' + nr + ',' + nc + ')，超出边界，不入栈',
          codeLine: 5
        });
        continue;
      }

      // Wall?
      if (!canMove(maze, rows, cols, cur.row, cur.col, dr, dc)) {
        history.push({
          visited: Array.from(visited),
          stack: [...stack],
          currentCell: current,
          neighborCell: nKey,
          action: 'check',
          description: '向' + name + '走 (' + nr + ',' + nc + ')，有墙壁，不入栈',
          codeLine: 5
        });
        continue;
      }

      // Already visited?
      if (visited.has(nKey)) {
        history.push({
          visited: Array.from(visited),
          stack: [...stack],
          currentCell: current,
          neighborCell: nKey,
          action: 'check',
          description: '向' + name + '走 (' + nr + ',' + nc + ')，已访问，不入栈',
          codeLine: 6
        });
        continue;
      }

      // Walkable and unvisited: push and remember
      visited.add(nKey);
      stack.push(nKey);
      parent.set(nKey, current);

      history.push({
        visited: Array.from(visited),
        stack: [...stack],
        currentCell: current,
        neighborCell: nKey,
        action: 'push',
        description: '向' + name + '走 (' + nr + ',' + nc + ')，入栈并记忆',
        codeLine: 7
      });
    }
  }

  if (!found) {
    history.push({
      visited: Array.from(visited),
      stack: [],
      currentCell: null,
      neighborCell: null,
      action: 'finish',
      description: '栈为空，未找到路径',
      codeLine: -1
    });
  }

  return history;
}

// ---- Component ----

const DFSComponent: React.FC<DFSComponentProps> = ({ pseudocode }) => {
  const { isDark } = useThemeStore();

  const [maze, setMaze] = useState<CellWalls[][]>([]);
  const [rows, setRows] = useState(ROWS);
  const [cols, setCols] = useState(COLS);
  const [history, setHistory] = useState<StepInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [mazeKey, setMazeKey] = useState(0);

  useEffect(() => {
    const newMaze = generateMaze(rows, cols);
    setMaze(newMaze);
    const steps = solveDFS(newMaze, rows, cols);
    setHistory(steps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [rows, cols, mazeKey]);

  const handleNewMaze = () => {
    setMazeKey(k => k + 1);
  };

  const handleSizeChange = (r: number, c: number) => {
    setRows(r);
    setCols(c);
  };

  // Animation loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const currentInfo = history[currentStep];
  if (!currentInfo || maze.length === 0) return null;

  const svgWidth = cols * CELL_SIZE + 1;
  const svgHeight = rows * CELL_SIZE + 1;

  const visitedSet = new Set(currentInfo.visited);
  const stackSet = new Set(currentInfo.stack);
  const currentCell = currentInfo.currentCell;
  const neighborCell = currentInfo.neighborCell;
  const finalPathSet = new Set(currentInfo.finalPath || []);

  function getCellColor(r: number, c: number): { fill: string; stroke: string } {
    const key = posKey(r, c);
    const isStart = r === 0 && c === 0;
    const isEnd = r === rows - 1 && c === cols - 1;

    if (finalPathSet.has(key)) {
      return isStart ? { fill: '#22c55e', stroke: '#16a34a' }
           : isEnd ? { fill: '#3b82f6', stroke: '#2563eb' }
           : { fill: '#22c55e', stroke: '#15803d' };
    }
    if (key === currentCell) return { fill: '#eab308', stroke: '#ca8a04' };
    if (key === neighborCell) return { fill: '#f97316', stroke: '#ea580c' };
    if (stackSet.has(key)) return { fill: '#c084fc', stroke: '#a855f7' };
    if (visitedSet.has(key)) return { fill: '#cbd5e1', stroke: '#94a3b8' };
    if (isStart) return { fill: '#22c55e', stroke: '#16a34a' };
    if (isEnd) return { fill: '#ef4444', stroke: '#dc2626' };
    return { fill: isDark ? '#374151' : '#ffffff', stroke: isDark ? '#4b5563' : '#e5e7eb' };
  }

  function getStackDisplay(): string[] {
    return currentInfo.stack.map(k => { const p = parseKey(k); return '(' + p.row + ',' + p.col + ')'; });
  }

  function getVisitedDisplay(): string[] {
    return currentInfo.visited.slice(-8).map(k => { const p = parseKey(k); return '(' + p.row + ',' + p.col + ')'; });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

      {/* Left Panel: Setup */}
      <div className={'xl:col-span-3 rounded-xl shadow-lg p-6 h-fit ' + (isDark ? 'bg-gray-800' : 'bg-white')}>
        <h2 className={'text-xl font-bold mb-6 pb-2 border-b ' + (isDark ? 'text-white border-gray-700' : 'text-slate-900 border-slate-200')}>
          迷宫设置
        </h2>

        <div className="mb-4">
          <label className={'block text-sm font-medium mb-2 ' + (isDark ? 'text-gray-300' : 'text-slate-700')}>
            迷宫大小
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: '小 (6x8)', r: 6, c: 8 }, { label: '中 (8x10)', r: 8, c: 10 }, { label: '大 (10x14)', r: 10, c: 14 }, { label: '超大 (12x16)', r: 12, c: 16 }].map(size => (
              <button key={size.label}
                onClick={() => size.r === rows && size.c === cols ? handleNewMaze() : handleSizeChange(size.r, size.c)}
                className={'py-2 px-3 rounded-lg text-xs font-medium transition-all ' +
                  (size.r === rows && size.c === cols
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-slate-700 hover:bg-gray-200')}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleNewMaze}
          className={'w-full py-3 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all hover:border-solid ' +
            (isDark ? 'border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600')}
        >
          <ArrowPathRoundedSquareIcon className="w-5 h-5" />
          <span className="font-medium">随机生成迷宫</span>
        </button>

        <div className="mt-6 space-y-2 text-xs">
          <p className={'font-semibold ' + (isDark ? 'text-gray-300' : 'text-slate-600')}>图例</p>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-500 inline-block"></span> 起点</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500 inline-block"></span> 终点</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-500 inline-block"></span> 当前弹出</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-orange-500 inline-block"></span> 正在检查</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-purple-400 inline-block"></span> 栈中等待</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-slate-300 inline-block"></span> 已访问</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-500 inline-block"></span> 找到路径</div>
        </div>
      </div>

      {/* Center: Maze Visualization */}
      <div className={'xl:col-span-6 rounded-xl shadow-lg p-6 ' + (isDark ? 'bg-gray-800' : 'bg-white')}>
        <h2 className={'text-xl font-bold mb-4 ' + (isDark ? 'text-white' : 'text-slate-900')}>迷宫寻路 - DFS (栈)</h2>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <button onClick={() => setIsPlaying(true)} disabled={isPlaying || currentStep >= history.length - 1}
            className={'flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ' +
              (isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}
          >
            <PlayIcon className="w-4 h-4" /><span>开始</span>
          </button>
          <button onClick={() => setIsPlaying(false)} disabled={!isPlaying}
            className={'flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ' +
              (isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white')}
          >
            <PauseIcon className="w-4 h-4" /><span>暂停</span>
          </button>
          <button onClick={() => { setIsPlaying(false); setCurrentStep(s => Math.max(0, s - 1)); }} disabled={currentStep <= 0}
            className={'flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ' +
              (isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-slate-500 hover:bg-slate-600 text-white')}
          >
            <BackwardIcon className="w-4 h-4" /><span>上一步</span>
          </button>
          <button onClick={() => { setIsPlaying(false); setCurrentStep(s => Math.min(history.length - 1, s + 1)); }} disabled={currentStep >= history.length - 1}
            className={'flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ' +
              (isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-slate-500 hover:bg-slate-600 text-white')}
          >
            <span>下一步</span><ForwardIcon className="w-4 h-4" />
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1 bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm text-sm hover:bg-red-700 transition"
          >
            <ArrowPathIcon className="w-4 h-4" /><span>重置</span>
          </button>
          <select value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))}
            className={'text-sm border rounded py-1 px-2 focus:ring-2 focus:ring-indigo-500 transition ' +
              (isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300')}
          >
            <option value="800">慢</option>
            <option value="400">中</option>
            <option value="150">快</option>
            <option value="50">极速</option>
          </select>
        </div>

        {/* SVG Maze */}
        <div className="overflow-auto flex justify-center">
          <svg width={svgWidth} height={svgHeight} viewBox={'0 0 ' + svgWidth + ' ' + svgHeight} className="border border-gray-300 rounded">
            {/* Cells */}
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const { fill, stroke } = getCellColor(r, c);
                return (
                  <rect key={r + '-' + c}
                    x={c * CELL_SIZE + 1} y={r * CELL_SIZE + 1}
                    width={CELL_SIZE - 1} height={CELL_SIZE - 1}
                    fill={fill} stroke={stroke} strokeWidth={0.5}
                  />
                );
              })
            )}

            {/* Walls */}
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const walls = maze[r][c];
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;
                const wallColor = isDark ? '#9ca3af' : '#374151';
                return (
                  <g key={'walls-' + r + '-' + c}>
                    {walls.top && <line x1={x} y1={y} x2={x + CELL_SIZE} y2={y} stroke={wallColor} strokeWidth={2} />}
                    {walls.right && <line x1={x + CELL_SIZE} y1={y} x2={x + CELL_SIZE} y2={y + CELL_SIZE} stroke={wallColor} strokeWidth={2} />}
                    {walls.bottom && <line x1={x} y1={y + CELL_SIZE} x2={x + CELL_SIZE} y2={y + CELL_SIZE} stroke={wallColor} strokeWidth={2} />}
                    {walls.left && <line x1={x} y1={y} x2={x} y2={y + CELL_SIZE} stroke={wallColor} strokeWidth={2} />}
                  </g>
                );
              })
            )}

            <text x={CELL_SIZE / 2} y={CELL_SIZE / 2 + 4} textAnchor="middle" className="text-xs font-bold" fill={isDark ? '#fff' : '#064e3b'}>S</text>
            <text x={(cols - 1) * CELL_SIZE + CELL_SIZE / 2} y={(rows - 1) * CELL_SIZE + CELL_SIZE / 2 + 4} textAnchor="middle" className="text-xs font-bold" fill={isDark ? '#fff' : '#7f1d1d'}>E</text>
          </svg>
        </div>

        {/* Progress */}
        <div className="mt-4 text-center">
          <span className={'text-sm ' + (isDark ? 'text-gray-400' : 'text-slate-500')}>
            步骤 {currentStep + 1} / {history.length}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: ((currentStep + 1) / history.length * 100) + '%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right Panel: Status & Code */}
      <div className="xl:col-span-3 space-y-6">
        <div className={'rounded-xl shadow-lg p-6 ' + (isDark ? 'bg-gray-800' : 'bg-white')}>
          <h3 className={'text-xl font-bold mb-4 border-b pb-2 ' + (isDark ? 'text-white border-gray-600' : 'text-slate-900 border-slate-100')}>
            算法状态
          </h3>

          <div className="space-y-4">
            <div>
              <p className={'text-lg font-semibold ' + (isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                {currentInfo.action === 'push' ? '入栈 (Push)' :
                 currentInfo.action === 'pop' ? '出栈 (Pop) — LIFO!' :
                 currentInfo.action === 'check' ? '检查邻居' :
                 currentInfo.action === 'found' ? '找到路径！' :
                 currentInfo.action === 'start' ? '初始化' : '完成'}
              </p>
            </div>

            <div className={'p-3 rounded-lg border ' + (isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200')}>
              <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>{currentInfo.description}</p>
            </div>

            {/* Stack — vertical LIFO display */}
            <div>
              <p className={'text-sm font-semibold mb-2 ' + (isDark ? 'text-gray-300' : 'text-slate-700')}>栈 (Stack) — 后进先出:</p>
              <div className={'flex flex-col items-center p-2 rounded-lg min-h-[40px] ' + (isDark ? 'bg-gray-900' : 'bg-gray-100')}>
                {currentInfo.stack.length > 0 ? (
                  <>
                    <span className={'text-[10px] font-bold mb-1 ' + (isDark ? 'text-red-400' : 'text-red-600')}>
                      ▲ 栈顶 — 下次 Pop
                    </span>
                    {[...currentInfo.stack].reverse().map((k, idx) => {
                      const isTop = idx === 0;
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <span className={'px-2 py-0.5 rounded text-[10px] font-mono font-bold border ' +
                            (isTop
                              ? (isDark ? 'bg-red-900/60 text-red-200 border-red-500' : 'bg-red-50 text-red-800 border-red-400')
                              : (isDark ? 'bg-purple-900/40 text-purple-200 border-purple-700' : 'bg-purple-50 text-purple-800 border-purple-300'))
                          }>
                            ({parseKey(k).row},{parseKey(k).col})
                          </span>
                          {idx < currentInfo.stack.length - 1 && <span className={'text-[10px] ' + (isDark ? 'text-gray-500' : 'text-gray-400')}>↓</span>}
                        </div>
                      );
                    })}
                    <span className={'text-[10px] font-bold mt-1 ' + (isDark ? 'text-gray-500' : 'text-gray-400')}>
                      ▼ 栈底
                    </span>
                  </>
                ) : <span className="text-gray-500 text-[10px] italic">空</span>}
              </div>
            </div>

            {/* Visited */}
            <div>
              <p className={'text-sm font-semibold mb-2 ' + (isDark ? 'text-gray-300' : 'text-slate-700')}>已访问 (最近):</p>
              <div className="flex flex-wrap gap-1">
                {getVisitedDisplay().map(k => (
                  <span key={k} className={'px-1.5 py-0.5 rounded-full text-[10px] ' + (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')}>{k}</span>
                ))}
                {currentInfo.visited.length > 8 && <span className="text-[10px] text-gray-400">+{currentInfo.visited.length - 8}</span>}
              </div>
            </div>

            {currentInfo.finalPath && (
              <div className={'p-2 rounded-lg ' + (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800')}>
                <p className="text-sm font-bold">路径长度: {currentInfo.finalPath.length - 1} 步</p>
                <p className="text-xs mt-1">共探索 {currentInfo.visited.length} 个格子</p>
                <p className="text-xs text-amber-600 mt-1">注意：DFS 不一定是最短路径！</p>
              </div>
            )}
          </div>
        </div>

        {/* Pseudocode */}
        <div className={'rounded-xl shadow-lg p-6 ' + (isDark ? 'bg-gray-800' : 'bg-white')}>
          <h3 className={'text-xl font-bold mb-4 ' + (isDark ? 'text-white' : 'text-slate-900')}>伪代码</h3>
          <div className={'rounded-lg p-4 text-sm font-mono overflow-auto max-h-[300px] ' + (isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800')}>
            {pseudocode && pseudocode.length > 0 ? pseudocode.map((line: string, idx: number) => (
              <div key={idx} className={'px-2 py-1 rounded transition-colors ' + (currentInfo.codeLine === idx ? 'bg-yellow-100 text-yellow-800 font-bold' : '')}>{line}</div>
            )) : (
              <div>
                <div className="text-gray-500 italic mb-2">DFS 栈式迷宫寻路:</div>
                <div className="space-y-0.5 text-xs">
                  <div className={currentInfo.codeLine === 1 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>1. stack.push(start), 记忆起点</div>
                  <div className={currentInfo.codeLine === 4 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>2. while stack not empty:</div>
                  <div className={currentInfo.codeLine === 4 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>3.   cell = stack.pop()  ← LIFO!</div>
                  <div className={currentInfo.codeLine === 5 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>4.   遍历上、下、左、右:</div>
                  <div className={currentInfo.codeLine === 5 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>5.     if 超出边界: 不入栈</div>
                  <div className={currentInfo.codeLine === 5 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>6.     if 有墙壁: 不入栈</div>
                  <div className={currentInfo.codeLine === 6 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>7.     if 已访问: 不入栈</div>
                  <div className={currentInfo.codeLine === 7 ? 'bg-yellow-100 text-yellow-800 font-bold px-1 rounded' : ''}>8.     入栈并记忆</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DFSComponent;
