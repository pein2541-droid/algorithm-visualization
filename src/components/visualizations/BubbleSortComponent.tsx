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
  highlightedIndices: number[]; // Indices being compared/swapped
  sortedIndices: number[]; // Indices already sorted
  action: 'compare' | 'swap' | 'sorted' | 'none';
  description: string;
  codeLine: number;
}

interface BubbleSortComponentProps {
    pseudocode: string[];
}

const BubbleSortComponent: React.FC<BubbleSortComponentProps> = ({ pseudocode }) => {
  const { isDark } = useThemeStore();
  
  // State for dynamic inputs
  const [inputArrayStr, setInputArrayStr] = useState<string>('5, 3, 8, 4, 2');
  const [array, setArray] = useState<number[]>([5, 3, 8, 4, 2]);
  
  // State for animation
  const [history, setHistory] = useState<StepInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);

  // Initialize History whenever array changes
  useEffect(() => {
    generateHistory(array);
  }, [array]);

  const generateHistory = (initialArray: number[]) => {
    const arr = [...initialArray];
    const n = arr.length;
    const newHistory: StepInfo[] = [];
    const sortedIndices: number[] = [];

    // Pseudocode mapping:
    // 0: def bubble_sort(arr):
    // 1:     n = len(arr)
    // 2:     for i in range(n):
    // 3:         for j in range(0, n - i - 1):
    // 4:             if arr[j] > arr[j + 1]:
    // 5:                 arr[j], arr[j + 1] = arr[j + 1], arr[j]

    // Initial state
    newHistory.push({
        array: [...arr],
        highlightedIndices: [],
        sortedIndices: [],
        action: 'none',
        description: '开始冒泡排序',
        codeLine: 0
    });

    newHistory.push({
        array: [...arr],
        highlightedIndices: [],
        sortedIndices: [],
        action: 'none',
        description: `数组长度 n = ${n}`,
        codeLine: 1
    });

    for (let i = 0; i < n; i++) {
        // Outer loop start
        newHistory.push({
            array: [...arr],
            highlightedIndices: [],
            sortedIndices: [...sortedIndices],
            action: 'none',
            description: `第 ${i + 1} 轮冒泡开始`,
            codeLine: 2
        });

        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            // Compare
            newHistory.push({
                array: [...arr],
                highlightedIndices: [j, j + 1],
                sortedIndices: [...sortedIndices],
                action: 'compare',
                description: `比较 ${arr[j]} 和 ${arr[j+1]}`,
                codeLine: 4
            });

            if (arr[j] > arr[j + 1]) {
                // Swap
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;

                newHistory.push({
                    array: [...arr],
                    highlightedIndices: [j, j + 1],
                    sortedIndices: [...sortedIndices],
                    action: 'swap',
                    description: `交换 ${arr[j]} 和 ${arr[j+1]}，因为 ${arr[j+1]} < ${arr[j]}`,
                    codeLine: 5
                });
            }
        }
        
        // Element at n-i-1 is now sorted
        sortedIndices.push(n - i - 1);
        newHistory.push({
            array: [...arr],
            highlightedIndices: [],
            sortedIndices: [...sortedIndices],
            action: 'sorted',
            description: `元素 ${arr[n - i - 1]} 已归位`,
            codeLine: 2 // Back to outer loop
        });
    }

    // Final state (all sorted)
    // Ensure all indices are marked sorted
    const finalSorted = Array.from({ length: n }, (_, k) => k);
    newHistory.push({
        array: [...arr],
        highlightedIndices: [],
        sortedIndices: finalSorted,
        action: 'sorted',
        description: '排序完成',
        codeLine: -1
    });

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
      const newArray = inputArrayStr.split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n));
      
      if (newArray.length > 0) {
          setArray(newArray);
      }
  };

  const handleRandomize = () => {
      const len = Math.floor(Math.random() * 6) + 5; // 5-10 elements
      const newArray = Array.from({ length: len }, () => Math.floor(Math.random() * 50) + 1);
      setArray(newArray);
      setInputArrayStr(newArray.join(', '));
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
                    placeholder="例如: 5, 3, 8, 4, 2"
                 />
             </div>
             <button 
                onClick={handleUpdateArray}
                className={`mt-2 w-full py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
             >
                 更新数组
             </button>
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
                const isSorted = currentInfo.sortedIndices.includes(idx);
                const maxVal = Math.max(...currentInfo.array, 1);
                // Leave space for text (approx 15-20%)
                const height = (value / maxVal) * 85;

                let barColorClass = isDark ? 'bg-teal-600' : 'bg-teal-500';
                if (isHighlighted) {
                    barColorClass = isDark ? 'bg-yellow-500' : 'bg-yellow-400';
                } else if (isSorted) {
                    barColorClass = isDark ? 'bg-green-600' : 'bg-green-500';
                }

                return (
                    <div key={idx} className="flex flex-col items-center justify-end h-full w-8 sm:w-12 transition-all duration-300">
                        <div 
                            className={`w-full rounded-t-md transition-all duration-300 ${barColorClass} ${isHighlighted ? 'scale-110 shadow-lg' : ''}`}
                            style={{ height: `${Math.max(height, 5)}%` }}
                        ></div>
                        <span className={`mt-2 font-mono text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {value}
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
                            {currentInfo.action === 'compare' ? '比较元素' : 
                             currentInfo.action === 'swap' ? '交换元素' : 
                             currentInfo.action === 'sorted' ? '位置锁定' : '准备中'}
                        </p>
                    </div>

                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
                        <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                            {currentInfo.description}
                        </p>
                    </div>
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

export default BubbleSortComponent;
