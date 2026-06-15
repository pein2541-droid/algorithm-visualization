import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/useStore';

interface Item {
    id: number;
    w: number;
    v: number;
}

const defaultItems: Item[] = [
  { id: 1, w: 2, v: 3 },
  { id: 2, w: 3, v: 4 },
  { id: 3, w: 4, v: 8 },
  { id: 4, w: 5, v: 8 },
  { id: 5, w: 9, v: 10 }
];

interface StepInfo {
  i: number;
  w: number;
  value: number;
  dependencies: { i: number; w: number }[];
  candidates: number[];
  decisionType: string;
  codeLine: number;
}

interface KnapsackComponentProps {
    pseudocode: string[];
}

const KnapsackComponent: React.FC<KnapsackComponentProps> = ({ pseudocode }) => {
  const { isDark } = useThemeStore();
  
  // State for dynamic inputs
  const [items, setItems] = useState<Item[]>(defaultItems);
  const [maxWeight, setMaxWeight] = useState(20);
  
  // State for animation
  const [history, setHistory] = useState<StepInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);

  // Initialize History whenever items or maxWeight changes
  useEffect(() => {
    // items array for 1-based indexing in logic
    // Logic uses items[1]...items[n]
    // UI input uses items[0]...items[n-1]
    const logicItems = [null, ...items];
    const n = items.length;
    
    // m[i][w] matrix
    const m = Array(n + 1).fill(null).map(() => Array(maxWeight + 1).fill(0));
    const newHistory: StepInfo[] = [];

    // Line mapping based on provided pseudocode structure:
    // 0: def knapsack...
    // 1: n = len(weights)
    // 2: dp = ...
    // 3: for i in range(1, n+1):
    // 4:     for w in range(1, W+1):
    // 5:         if weights[i-1] <= w:
    // 6:             dp[i][w] = max(...)
    // 7:         else:
    // 8:             dp[i][w] = dp[i-1][w]
    // 9: return dp[n][W]

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= maxWeight; w++) {
        const item = logicItems[i] as Item; // Safe cast
        const stepInfo: StepInfo = {
          i,
          w,
          value: 0,
          dependencies: [],
          candidates: [],
          decisionType: '',
          codeLine: -1
        };

        if (item.w > w) {
          // Cannot fit item
          m[i][w] = m[i - 1][w];
          stepInfo.dependencies.push({ i: i - 1, w });
          stepInfo.decisionType = 'direct';
          stepInfo.codeLine = 8; // else branch
        } else {
          // Can fit item
          const candidate1 = m[i - 1][w]; // Don't take
          const candidate2 = m[i - 1][w - item.w] + item.v; // Take
          m[i][w] = Math.max(candidate1, candidate2);

          stepInfo.dependencies.push(
            { i: i - 1, w },
            { i: i - 1, w: w - item.w }
          );
          stepInfo.candidates = [candidate1, candidate2];
          stepInfo.decisionType = candidate2 > candidate1 ? 'take' : 'keep';
          stepInfo.codeLine = 6; // max(...) line
        }

        stepInfo.value = m[i][w];
        newHistory.push(stepInfo);
      }
    }
    setHistory(newHistory);
    setCurrentStep(0); // Reset animation when inputs change
    setIsPlaying(false);
  }, [items, maxWeight]);

  // Animation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < history.length) {
      timer = setTimeout(() => {
        setCurrentStep(prev => {
            if (prev >= history.length - 1) {
                setIsPlaying(false);
                return prev;
            }
            return prev + 1;
        });
      }, speed);
    } else if (currentStep >= history.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleAddItem = () => {
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      setItems([...items, { id: newId, w: 1, v: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
  };

  const handleUpdateItem = (index: number, field: 'w' | 'v', value: number) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
  };

  const currentInfo = history[currentStep];

  // Derive Grid State
  const gridState = useMemo(() => {
    // 1-based logic items
    const n = items.length;
    // Grid size: (n+1) rows, (maxWeight+1) cols
    const grid = Array(n + 1).fill(null).map(() => Array(maxWeight + 1).fill({ value: 0, classes: '' }));
    
    const baseClass = `p-2 border-b border-r font-mono min-w-[60px] transition-colors duration-300 ${isDark ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-600'}`;

    // Initialize grid
    for(let i=0; i<=n; i++) {
        for(let w=0; w<=maxWeight; w++) {
            grid[i][w] = { value: 0, classes: baseClass };
        }
    }

    // Apply values from history up to currentStep
    for (let k = 0; k <= currentStep && k < history.length; k++) {
        const { i, w, value } = history[k];
        if (i <= n && w <= maxWeight) {
             grid[i][w] = { ...grid[i][w], value };
        }
    }

    // Apply highlights
    if (currentStep < history.length) {
        const { i, w, dependencies, candidates, decisionType } = history[currentStep];
        
        if (i <= n && w <= maxWeight) {
             // Current Cell
            grid[i][w] = { 
                ...grid[i][w], 
                classes: `${baseClass} ${isDark ? 'bg-indigo-900 text-white' : 'bg-indigo-600 text-white'} font-bold transform scale-105 shadow-lg` 
            };

            // Dependencies
            dependencies.forEach(({ i: depI, w: depW }) => {
                 if (depI <= n && depW <= maxWeight) {
                    grid[depI][depW] = {
                        ...grid[depI][depW],
                        classes: `${baseClass} ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-200'}`
                    };
                 }
            });

            // Candidates
            if (candidates.length > 0 && items[i-1]) {
                 const item = items[i-1]; // items is 0-indexed, logic i is 1-indexed
                 const keepI = i-1; 
                 const keepW = w;
                 const takeI = i-1;
                 const takeW = w - item.w;

                 let keepClass = baseClass;
                 let takeClass = baseClass;

                 if (decisionType === 'take') {
                     takeClass += ` ${isDark ? 'bg-green-900/50 ring-2 ring-green-500' : 'bg-green-200 ring-2 ring-green-500'}`;
                     keepClass += ` ${isDark ? 'bg-red-900/50' : 'bg-red-200'}`;
                 } else {
                     keepClass += ` ${isDark ? 'bg-red-900/50 ring-2 ring-red-500' : 'bg-red-200 ring-2 ring-red-500'}`;
                     takeClass += ` ${isDark ? 'bg-green-900/50' : 'bg-green-200'}`;
                 }

                 if (keepI >= 0 && keepW >= 0) grid[keepI][keepW] = { ...grid[keepI][keepW], classes: keepClass };
                 if (takeI >= 0 && takeW >= 0) grid[takeI][takeW] = { ...grid[takeI][takeW], classes: takeClass };
            }
        }
    }
    
    return grid;
  }, [history, currentStep, isDark, items, maxWeight]);

  if (history.length === 0) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Left Panel: Setup (3 cols) */}
      <div className={`xl:col-span-3 rounded-xl shadow-lg p-6 h-fit ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
         <h2 className={`text-xl font-bold mb-6 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-slate-900 border-slate-200'}`}>参数设置 (Setup)</h2>
         
         {/* Max Weight Input */}
         <div className="mb-6">
             <label htmlFor="maxWeightInput" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>背包容量 (Capacity)</label>
             <input 
                type="number" 
                id="maxWeightInput"
                value={maxWeight}
                onChange={(e) => setMaxWeight(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
             />
         </div>

         {/* Items List */}
         <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>物品列表 (Items)</h3>
         <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
             {items.map((item, index) => (
                 <div key={item.id} className={`p-3 rounded-lg border flex items-center gap-2 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
                     <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-slate-200 text-slate-600'}`}>
                         {index + 1}
                     </div>
                     <div className="flex-1 grid grid-cols-2 gap-2">
                         <div>
                             <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>重量</label>
                             <input 
                                type="number" 
                                value={item.w}
                                onChange={(e) => handleUpdateItem(index, 'w', Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-full px-2 py-1 text-sm rounded border outline-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                             />
                         </div>
                         <div>
                             <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>价值</label>
                             <input 
                                type="number" 
                                value={item.v}
                                onChange={(e) => handleUpdateItem(index, 'v', Math.max(0, parseInt(e.target.value) || 0))}
                                className={`w-full px-2 py-1 text-sm rounded border outline-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                             />
                         </div>
                     </div>
                     <button 
                        onClick={() => handleRemoveItem(index)}
                        className={`p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors`}
                        title="删除物品"
                     >
                         <XMarkIcon className="w-5 h-5" />
                     </button>
                 </div>
             ))}
         </div>
         <button 
            onClick={handleAddItem}
            className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all hover:border-solid ${isDark ? 'border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600'}`}
         >
             <PlusIcon className="w-5 h-5" />
             <span>添加物品</span>
         </button>
      </div>

      {/* Center Panel: Table & Controls (6 cols) */}
      <div className={`xl:col-span-6 rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>动态规划表 (DP Table)</h2>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button 
                onClick={() => setIsPlaying(true)} 
                disabled={isPlaying || currentStep >= history.length - 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
                <PlayIcon className="w-4 h-4" />
                <span>开始</span>
            </button>
            <button 
                onClick={() => setIsPlaying(false)} 
                disabled={!isPlaying}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
            >
                <PauseIcon className="w-4 h-4" />
                <span>暂停</span>
            </button>
            <button 
                onClick={() => { setIsPlaying(false); setCurrentStep(s => Math.max(0, s - 1)); }} 
                disabled={currentStep <= 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-slate-500 hover:bg-slate-600 text-white'}`}
            >
                <BackwardIcon className="w-4 h-4" />
                <span>上一步</span>
            </button>
            <button 
                onClick={() => { setIsPlaying(false); setCurrentStep(s => Math.min(history.length - 1, s + 1)); }} 
                disabled={currentStep >= history.length - 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-slate-500 hover:bg-slate-600 text-white'}`}
            >
                <span>下一步</span>
                <ForwardIcon className="w-4 h-4" />
            </button>
             <button 
                onClick={handleReset} 
                className="flex items-center gap-1 bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm text-sm hover:bg-red-700 transition duration-300"
            >
                <ArrowPathIcon className="w-4 h-4" />
                <span>重置</span>
            </button>
            <div className="flex items-center gap-2 ml-2">
                <label htmlFor="speed" className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>速度:</label>
                <select 
                    id="speed" 
                    value={speed} 
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className={`text-sm border rounded py-1 px-2 focus:ring-2 focus:ring-indigo-500 transition ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300'}`}
                >
                    <option value="800">慢</option>
                    <option value="400">中</option>
                    <option value="150">快</option>
                </select>
            </div>
        </div>

        {/* Table Container */}
        <div className={`overflow-x-auto border rounded-lg max-h-[600px] overflow-y-auto ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
            <table className="w-full text-center border-collapse">
                <thead className="sticky top-0 z-20 shadow-sm">
                    <tr className={isDark ? 'bg-gray-700' : 'bg-slate-100'}>
                        <th className={`p-2 border-b border-r text-sm font-semibold sticky left-0 z-30 ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>物品\容量</th>
                        {Array.from({ length: maxWeight + 1 }).map((_, w) => (
                            <th key={w} className={`p-2 border-b border-r text-sm font-semibold min-w-[60px] ${isDark ? 'text-gray-400 border-gray-600' : 'text-slate-500 border-slate-200'}`}>{w}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Row 0 */}
                    <tr>
                        <th className={`p-2 border-b border-r text-sm font-semibold sticky left-0 z-10 ${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                            初始 (0 items)
                        </th>
                        {Array.from({ length: maxWeight + 1 }).map((_, w) => (
                             <td key={w} className={gridState[0][w].classes}>
                                 {gridState[0][w].value}
                             </td>
                        ))}
                    </tr>
                    {items.map((item, i) => ( // UI Index i (0-based) corresponds to Logic Index i+1
                        <tr key={i}>
                            <th className={`p-2 border-b border-r text-sm font-semibold sticky left-0 z-10 ${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {`物品${i+1} (w:${item.w}, v:${item.v})`}
                            </th>
                            {Array.from({ length: maxWeight + 1 }).map((_, w) => (
                                <td key={w} className={gridState[i+1][w].classes}>
                                    {gridState[i+1][w].value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Right Panel: Status & Code (3 cols) */}
      <div className="xl:col-span-3 space-y-6">
          {/* Status Card */}
          <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 border-b pb-2 ${isDark ? 'text-white border-gray-600' : 'text-slate-900 border-slate-100'}`}>算法状态</h3>
                
                {currentStep < history.length ? (
                    <div className="space-y-4">
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>步骤 {currentStep + 1} / {history.length}</p>
                            <p className={`text-lg font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                处理: 物品{currentInfo.i} @ 容量 {currentInfo.w}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                物品信息: 重量={items[currentInfo.i - 1]?.w}, 价值={items[currentInfo.i - 1]?.v}
                            </p>
                        </div>

                        {currentInfo.candidates.length > 0 ? (
                            <>
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-slate-900'}`}>决策比较:</p>
                                    <ul className="space-y-2 text-sm">
                                        <li className={`flex items-center p-2 rounded-md ${currentInfo.decisionType === 'keep' ? (isDark ? 'bg-red-900/30 border border-red-500' : 'bg-red-50 border border-red-500') : ''}`}>
                                            <span className="font-bold text-red-500 mr-2 w-12">不拿:</span>
                                            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                                                继承: <b className="text-lg">{currentInfo.candidates[0]}</b>
                                            </span>
                                        </li>
                                        <li className={`flex items-center p-2 rounded-md ${currentInfo.decisionType === 'take' ? (isDark ? 'bg-green-900/30 border border-green-500' : 'bg-green-50 border border-green-500') : ''}`}>
                                            <span className="font-bold text-green-500 mr-2 w-12">拿取:</span>
                                            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                                                价值+剩余: <b className="text-lg">{currentInfo.candidates[1]}</b>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <div className={`p-3 rounded-lg text-sm ${currentInfo.decisionType === 'take' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800')}`}>
                                    <span className="font-bold">结果:</span> {currentInfo.decisionType === 'take' ? '拿取' : '不拿'} (最大值: {Math.max(...currentInfo.candidates)})
                                </div>
                            </>
                        ) : (
                             <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-800'}`}>
                                  <p><span className="font-bold">决策:</span> 直接继承</p>
                                  <p className="text-xs mt-1">原因: 物品太重 ({items[currentInfo.i - 1]?.w} &gt; {currentInfo.w})</p>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className={isDark ? 'text-gray-400' : 'text-slate-600'}>
                        <p>准备就绪</p>
                    </div>
                )}
          </div>

          {/* Pseudocode Panel */}
          <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
             <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>伪代码</h3>
             <div className={`rounded-lg p-4 text-sm font-mono overflow-auto max-h-[400px] ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                 {pseudocode && pseudocode.length > 0 ? pseudocode.map((line, idx) => (
                     <div 
                        key={idx}
                        className={`px-2 py-1 rounded transition-colors ${
                            currentStep < history.length && history[currentStep].codeLine === idx
                            ? 'bg-yellow-100 text-yellow-800 font-bold'
                            : ''
                        }`}
                     >
                         {line}
                     </div>
                 )) : (
                     <p className="text-gray-500 italic">暂无伪代码</p>
                 )}
             </div>
          </div>
      </div>

    </div>
  );
};

export default KnapsackComponent;
