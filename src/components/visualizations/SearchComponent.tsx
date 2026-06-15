import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/useStore';

interface StepInfo {
  array: number[];
  highlightedIndices: number[]; // Indices currently being checked
  foundIndex: number | null; // Index where target is found
  low: number | null; // For Binary Search
  high: number | null; // For Binary Search
  mid: number | null; // For Binary Search
  action: 'check' | 'found' | 'not-found' | 'narrow' | 'none';
  description: string;
  codeLine: number;
}

interface SearchComponentProps {
    algorithmName: string;
    pseudocode: string[];
}

const SearchComponent: React.FC<SearchComponentProps> = ({ algorithmName, pseudocode }) => {
  const { isDark } = useThemeStore();
  const isBinarySearch = algorithmName.includes('二分');
  
  // State for dynamic inputs
  const [inputArrayStr, setInputArrayStr] = useState<string>(
      isBinarySearch ? '1, 3, 5, 7, 9, 11, 13, 15, 17, 19' : '8, 2, 6, 3, 5, 1, 9, 4, 7'
  );
  const [array, setArray] = useState<number[]>(
      isBinarySearch ? [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] : [8, 2, 6, 3, 5, 1, 9, 4, 7]
  );
  const [target, setTarget] = useState<number>(isBinarySearch ? 7 : 5);
  
  // State for animation
  const [history, setHistory] = useState<StepInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);

  // Initialize History whenever array or target changes
  useEffect(() => {
    generateHistory(array, target);
  }, [array, target, algorithmName]);

  const generateHistory = (initialArray: number[], targetVal: number) => {
    const arr = [...initialArray];
    const n = arr.length;
    const newHistory: StepInfo[] = [];

    // Initial state
    newHistory.push({
        array: [...arr],
        highlightedIndices: [],
        foundIndex: null,
        low: isBinarySearch ? 0 : null,
        high: isBinarySearch ? n - 1 : null,
        mid: null,
        action: 'none',
        description: `开始${algorithmName}，目标值: ${targetVal}`,
        codeLine: 0
    });

    if (isBinarySearch) {
        // Binary Search Logic
        let low = 0;
        let high = n - 1;
        let found = false;

        // 0: low = 0, high = n-1
        // 1: while low <= high:
        // 2:   mid = (low + high) // 2
        // 3:   if arr[mid] == target: return mid
        // 4:   elif arr[mid] < target: low = mid + 1
        // 5:   else: high = mid - 1
        // 6: return -1

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            
            newHistory.push({
                array: [...arr],
                highlightedIndices: [mid],
                foundIndex: null,
                low,
                high,
                mid,
                action: 'check',
                description: `检查中间元素 arr[${mid}] = ${arr[mid]}`,
                codeLine: 2
            });

            if (arr[mid] === targetVal) {
                found = true;
                newHistory.push({
                    array: [...arr],
                    highlightedIndices: [mid],
                    foundIndex: mid,
                    low,
                    high,
                    mid,
                    action: 'found',
                    description: `找到目标值 ${targetVal} 在索引 ${mid}`,
                    codeLine: 3
                });
                break;
            } else if (arr[mid] < targetVal) {
                newHistory.push({
                    array: [...arr],
                    highlightedIndices: [mid],
                    foundIndex: null,
                    low,
                    high,
                    mid,
                    action: 'narrow',
                    description: `${arr[mid]} < ${targetVal}，目标在右侧，调整 low = ${mid + 1}`,
                    codeLine: 4
                });
                low = mid + 1;
            } else {
                newHistory.push({
                    array: [...arr],
                    highlightedIndices: [mid],
                    foundIndex: null,
                    low,
                    high,
                    mid,
                    action: 'narrow',
                    description: `${arr[mid]} > ${targetVal}，目标在左侧，调整 high = ${mid - 1}`,
                    codeLine: 5
                });
                high = mid - 1;
            }
        }

        if (!found) {
            newHistory.push({
                array: [...arr],
                highlightedIndices: [],
                foundIndex: null,
                low,
                high,
                mid: null,
                action: 'not-found',
                description: `未找到目标值 ${targetVal}`,
                codeLine: 6
            });
        }

    } else {
        // Linear Search Logic
        // 0: for i in range(n):
        // 1:   if arr[i] == target:
        // 2:     return i
        // 3: return -1
        
        let found = false;
        for (let i = 0; i < n; i++) {
            newHistory.push({
                array: [...arr],
                highlightedIndices: [i],
                foundIndex: null,
                low: null,
                high: null,
                mid: null,
                action: 'check',
                description: `检查 arr[${i}] = ${arr[i]} 是否等于 ${targetVal}`,
                codeLine: 1
            });

            if (arr[i] === targetVal) {
                found = true;
                newHistory.push({
                    array: [...arr],
                    highlightedIndices: [i],
                    foundIndex: i,
                    low: null,
                    high: null,
                    mid: null,
                    action: 'found',
                    description: `找到目标值 ${targetVal} 在索引 ${i}`,
                    codeLine: 2
                });
                break;
            }
        }

        if (!found) {
            newHistory.push({
                array: [...arr],
                highlightedIndices: [],
                foundIndex: null,
                low: null,
                high: null,
                mid: null,
                action: 'not-found',
                description: `遍历结束，未找到目标值 ${targetVal}`,
                codeLine: 3
            });
        }
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Animation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
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

  const handleArrayInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputArrayStr(e.target.value);
  };

  const handleUpdateArray = () => {
      let newArray = inputArrayStr.split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n));
      
      if (newArray.length > 0) {
          if (isBinarySearch) {
              // Auto-sort for binary search if typically expected, 
              // but maybe let user shoot themselves in the foot? 
              // Usually demos auto-sort or warn. Let's auto-sort to be helpful.
              newArray.sort((a, b) => a - b);
              setInputArrayStr(newArray.join(', '));
          }
          setArray(newArray);
      }
  };

  const handleRandomize = () => {
      const len = Math.floor(Math.random() * 6) + 10; // 10-15 elements
      let newArray = Array.from({ length: len }, () => Math.floor(Math.random() * 50) + 1);
      
      if (isBinarySearch) {
          newArray.sort((a, b) => a - b);
          // Remove duplicates for cleaner binary search demo? Not strictly necessary but nice.
          newArray = Array.from(new Set(newArray)); 
      }
      
      setArray(newArray);
      setInputArrayStr(newArray.join(', '));
      // Pick a random target from array or random
      if (Math.random() > 0.3) {
          setTarget(newArray[Math.floor(Math.random() * newArray.length)]);
      } else {
          setTarget(Math.floor(Math.random() * 50));
      }
  };

  const currentInfo = history[currentStep];

  if (!currentInfo) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Left Panel: Setup (3 cols) */}
      <div className={`xl:col-span-3 rounded-xl shadow-lg p-6 h-fit ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
         <h2 className={`text-xl font-bold mb-6 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-slate-900 border-slate-200'}`}>参数设置 (Setup)</h2>
         
         <div className="mb-6">
             <label htmlFor="arrayInput" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                 输入数组 (逗号分隔)
             </label>
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    id="arrayInput"
                    value={inputArrayStr}
                    onChange={handleArrayInput}
                    className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    placeholder="例如: 1, 3, 5, 7, 9"
                 />
             </div>
             <button 
                onClick={handleUpdateArray}
                className={`mt-2 w-full py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
             >
                 更新数组 {isBinarySearch && '(自动排序)'}
             </button>
         </div>

         <div className="mb-6">
             <label htmlFor="targetInput" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                 目标值 (Target)
             </label>
             <input 
                type="number" 
                id="targetInput"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
             />
         </div>

         <button 
            onClick={handleRandomize}
            className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all hover:border-solid ${isDark ? 'border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600'}`}
         >
             <ArrowPathRoundedSquareIcon className="w-5 h-5" />
             <span>随机生成</span>
         </button>
      </div>

      {/* Center Panel: Visualization & Controls (6 cols) */}
      <div className={`xl:col-span-6 rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>动画演示 (Visualization)</h2>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
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

        {/* Visualization Area */}
        <div className={`flex items-end justify-center gap-2 h-64 p-4 border rounded-lg ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-slate-200'}`}>
            {currentInfo.array.map((value, idx) => {
                const isHighlighted = currentInfo.highlightedIndices.includes(idx);
                const isFound = currentInfo.foundIndex === idx;
                
                // For Binary Search: fade out elements outside low-high range?
                // Or just highlight the range?
                // Let's dim the ones outside range if binary search
                let isOutOfRange = false;
                if (isBinarySearch && currentInfo.low !== null && currentInfo.high !== null) {
                    if (idx < currentInfo.low || idx > currentInfo.high) {
                        isOutOfRange = true;
                    }
                }

                const maxVal = Math.max(...currentInfo.array, 1);
                // Leave space for text
                const height = (value / maxVal) * 85;

                let barColorClass = isDark ? 'bg-teal-600' : 'bg-teal-500';
                
                if (isFound) {
                    barColorClass = isDark ? 'bg-green-600' : 'bg-green-500';
                } else if (isHighlighted) {
                    barColorClass = isDark ? 'bg-yellow-500' : 'bg-yellow-400';
                } else if (isOutOfRange) {
                    barColorClass = isDark ? 'bg-gray-700 opacity-50' : 'bg-gray-300 opacity-50';
                }

                return (
                    <div key={idx} className="flex flex-col items-center justify-end h-full w-8 sm:w-12 transition-all duration-300">
                        <div 
                            className={`w-full rounded-t-md transition-all duration-300 ${barColorClass} ${isHighlighted || isFound ? 'scale-110 shadow-lg' : ''}`}
                            style={{ height: `${Math.max(height, 5)}%` }}
                        ></div>
                        <span className={`mt-2 font-mono text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'} ${isOutOfRange ? 'opacity-50' : ''}`}>
                            {value}
                        </span>
                        {/* Indices for Binary Search can be helpful */}
                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {idx}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Right Panel: Status & Code (3 cols) */}
      <div className="xl:col-span-3 space-y-6">
          {/* Status Card */}
          <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 border-b pb-2 ${isDark ? 'text-white border-gray-600' : 'text-slate-900 border-slate-100'}`}>算法状态</h3>
                
                <div className="space-y-4">
                    <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>步骤 {currentStep + 1} / {history.length}</p>
                        <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {currentInfo.action === 'check' ? '检查元素' : 
                             currentInfo.action === 'found' ? '找到目标' : 
                             currentInfo.action === 'not-found' ? '未找到' : 
                             currentInfo.action === 'narrow' ? '缩小范围' : '准备中'}
                        </p>
                    </div>

                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
                        <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                            {currentInfo.description}
                        </p>
                    </div>
                    
                    {/* Binary Search Specific Details */}
                    {isBinarySearch && currentInfo.low !== null && (
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="text-xs text-gray-500">Low</div>
                                <div className="font-bold">{currentInfo.low}</div>
                            </div>
                            <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="text-xs text-gray-500">Mid</div>
                                <div className="font-bold">{currentInfo.mid !== null ? currentInfo.mid : '-'}</div>
                            </div>
                            <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="text-xs text-gray-500">High</div>
                                <div className="font-bold">{currentInfo.high}</div>
                            </div>
                        </div>
                    )}
                </div>
          </div>

          {/* Pseudocode Panel */}
          <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
             <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>伪代码</h3>
             <div className={`rounded-lg p-4 text-sm font-mono overflow-auto max-h-[400px] ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                 {pseudocode && pseudocode.length > 0 ? pseudocode.map((line, idx) => (
                     <div 
                        key={idx}
                        className={`px-2 py-1 rounded transition-colors ${
                            currentInfo.codeLine === idx
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

export default SearchComponent;
