import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/useStore';

interface GraphNode {
    id: number;
    x: number;
    y: number;
}

interface GraphEdge {
    source: number;
    target: number;
}

interface StepInfo {
  visited: number[]; // Result sequence (Inorder)
  stack: number[]; // For traversal stack tracking
  currentNode: number | null;
  highlightedEdge: {source: number, target: number} | null;
  action: 'start' | 'traverse_left' | 'visit' | 'traverse_right' | 'return' | 'finish';
  description: string;
  codeLine: number;
}

interface BinaryTreeComponentProps {
    pseudocode: string[];
}

const BinaryTreeComponent: React.FC<BinaryTreeComponentProps> = ({ pseudocode }) => {
  const { isDark } = useThemeStore();
  
  // State for dynamic inputs
  // Default tree:
  //      0
  //     / \
  //    1   2
  //   / \ /
  //  3  4 5
  const [edgeInput, setEdgeInput] = useState<string>('0-1, 0-2, 1-3, 1-4, 2-5');
  const [startNode, setStartNode] = useState<number>(0);
  
  // Graph Data
  const [adjList, setAdjList] = useState<Record<number, number[]>>({});
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  // State for animation
  const [history, setHistory] = useState<StepInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // Initialize Graph and History
  useEffect(() => {
      parseGraph(edgeInput);
  }, []); // Run once on mount, then user triggers updates manually

  // Re-generate history when graph or startNode changes
  useEffect(() => {
      if (Object.keys(adjList).length > 0) {
          generateHistory();
      }
  }, [adjList, startNode]);

  const parseGraph = (input: string) => {
      const adj: Record<number, number[]> = {};
      const uniqueNodes = new Set<number>();
      const newEdges: GraphEdge[] = [];

      const parts = input.split(/[,;\s]+/);
      parts.forEach(part => {
          if (!part.includes('-')) return;
          const [uStr, vStr] = part.split('-');
          const u = parseInt(uStr.trim());
          const v = parseInt(vStr.trim());

          if (isNaN(u) || isNaN(v)) return;

          uniqueNodes.add(u);
          uniqueNodes.add(v);

          if (!adj[u]) adj[u] = [];
          if (!adj[v]) adj[v] = []; // Ensure v exists in adj
          
          // Directed edges for Tree (Parent -> Child)
          if (!adj[u].includes(v)) adj[u].push(v);

          // Avoid duplicate edges for rendering
          const edgeExists = newEdges.some(e => (e.source === u && e.target === v));
          if (!edgeExists) {
              newEdges.push({ source: u, target: v });
          }
      });

      // Sort neighbors: First is Left, Second is Right
      Object.keys(adj).forEach(key => {
          adj[Number(key)].sort((a, b) => a - b);
      });

      // Generate Layout (Tree Structure)
      const nodeList = Array.from(uniqueNodes).sort((a, b) => a - b);
      const levels: Record<number, number> = {};
      
      // BFS to determine levels for tree layout
      const queue: {id: number, level: number}[] = [];
      const visitedForLayout = new Set<number>();
      
      // Try to start from startNode if possible, else first node
      const root = uniqueNodes.has(startNode) ? startNode : nodeList[0];
      
      if (nodeList.length > 0) {
          queue.push({ id: root, level: 0 });
          visitedForLayout.add(root);
          levels[root] = 0;
      }

      while (queue.length > 0) {
          const { id, level } = queue.shift()!;
          const neighbors = adj[id] || [];
          neighbors.forEach(neighbor => {
              if (!visitedForLayout.has(neighbor)) {
                  visitedForLayout.add(neighbor);
                  levels[neighbor] = level + 1;
                  queue.push({ id: neighbor, level: level + 1 });
              }
          });
      }

      // Handle disconnected components (orphans)
      nodeList.forEach(node => {
          if (!visitedForLayout.has(node)) {
              levels[node] = 0;
              visitedForLayout.add(node);
          }
      });

      const maxLevel = Math.max(...Object.values(levels));
      const width = 600;
      const height = 400;
      const levelHeight = height / (maxLevel + 2);

      const nodesByLevel: Record<number, number[]> = {};
      Object.entries(levels).forEach(([id, level]) => {
          if (!nodesByLevel[level]) nodesByLevel[level] = [];
          nodesByLevel[level].push(Number(id));
      });

      // Simple tree layout: spread nodes in level evenly
      const newNodes = nodeList.map(id => {
          const level = levels[id];
          const nodesInThisLevel = nodesByLevel[level];
          // Sort nodes in level by their value to keep order consistent if possible
          nodesInThisLevel.sort((a,b) => a-b); 
          const indexInLevel = nodesInThisLevel.indexOf(id);
          const levelWidth = width / (nodesInThisLevel.length + 1);
          
          return {
              id,
              x: (indexInLevel + 1) * levelWidth,
              y: (level + 1) * levelHeight
          };
      });

      setAdjList(adj);
      setNodes(newNodes);
      setEdges(newEdges);
  };

  const handleUpdateGraph = () => {
      parseGraph(edgeInput);
  };

  const handleRandomGraph = () => {
      // Generate a random binary tree
      const n = Math.floor(Math.random() * 5) + 5; // 5-9 nodes
      const newEdges: string[] = [];
      const childrenCount: Record<number, number> = {};
      
      for (let i = 0; i < n; i++) childrenCount[i] = 0;

      // Ensure connectivity by building a tree
      for (let i = 1; i < n; i++) {
          // Find a parent that has < 2 children
          const potentialParents = Array.from({length: i}, (_, k) => k).filter(p => childrenCount[p] < 2);
          if (potentialParents.length === 0) break; // Should not happen with this logic

          const parent = potentialParents[Math.floor(Math.random() * potentialParents.length)];
          newEdges.push(`${parent}-${i}`);
          childrenCount[parent]++;
      }
      
      const inputStr = newEdges.join(', ');
      setEdgeInput(inputStr);
      parseGraph(inputStr);
      setStartNode(0);
  };

  const generateHistory = () => {
      const newHistory: StepInfo[] = [];
      const visitedSeq: number[] = []; // Inorder sequence
      const stack: number[] = [];

      // Pseudocode mapping (Inorder):
      // 0: function inorder(node):
      // 1:   if node is None: return
      // 2:   inorder(node.left)
      // 3:   visit(node)
      // 4:   inorder(node.right)
      
      const inorder = (u: number, currentStack: number[]) => {
          // Enter Node
          newHistory.push({
              visited: [...visitedSeq],
              stack: [...currentStack],
              currentNode: u,
              highlightedEdge: null,
              action: 'start',
              description: `到达节点 ${u}`,
              codeLine: 0
          });

          const children = adjList[u] || [];
          // Assume sorted: children[0] is Left, children[1] is Right
          const left = children.length > 0 ? children[0] : null;
          const right = children.length > 1 ? children[1] : null;

          // 1. Go Left
          if (left !== null) {
              newHistory.push({
                  visited: [...visitedSeq],
                  stack: [...currentStack],
                  currentNode: u,
                  highlightedEdge: {source: u, target: left},
                  action: 'traverse_left',
                  description: `准备遍历左子树 (节点 ${left})`,
                  codeLine: 2
              });
              
              inorder(left, [...currentStack, left]);
              
              // Return to u
              newHistory.push({
                  visited: [...visitedSeq],
                  stack: [...currentStack],
                  currentNode: u,
                  highlightedEdge: {source: u, target: left}, // Highlight return path?
                  action: 'return',
                  description: `从左子树返回节点 ${u}`,
                  codeLine: 3 // Ready to visit
              });
          }

          // 2. Visit Node
          visitedSeq.push(u);
          newHistory.push({
              visited: [...visitedSeq],
              stack: [...currentStack],
              currentNode: u,
              highlightedEdge: null,
              action: 'visit',
              description: `访问节点 ${u} (加入结果序列)`,
              codeLine: 3
          });

          // 3. Go Right
          if (right !== null) {
              newHistory.push({
                  visited: [...visitedSeq],
                  stack: [...currentStack],
                  currentNode: u,
                  highlightedEdge: {source: u, target: right},
                  action: 'traverse_right',
                  description: `准备遍历右子树 (节点 ${right})`,
                  codeLine: 4
              });
              
              inorder(right, [...currentStack, right]);
              
              // Return to u
              newHistory.push({
                  visited: [...visitedSeq],
                  stack: [...currentStack],
                  currentNode: u,
                  highlightedEdge: {source: u, target: right},
                  action: 'return',
                  description: `从右子树返回节点 ${u}`,
                  codeLine: 0 // End of function
              });
          }
      };

      if (nodes.find(n => n.id === startNode)) {
        inorder(startNode, [startNode]);
      }
      
      newHistory.push({
          visited: [...visitedSeq],
          stack: [],
          currentNode: null,
          highlightedEdge: null,
          action: 'finish',
          description: '中序遍历完成',
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

  const currentInfo = history[currentStep];

  if (!currentInfo) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Left Panel: Setup (3 cols) */}
      <div className={`xl:col-span-3 rounded-xl shadow-lg p-6 h-fit ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
         <h2 className={`text-xl font-bold mb-6 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-slate-900 border-slate-200'}`}>参数设置 (Setup)</h2>
         
         <div className="mb-6">
             <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                 边列表 (格式: u-v)
                 <span className="block text-xs text-gray-500 font-normal mt-1">
                     注意: 较小的邻居ID作为左子节点，较大的作为右子节点。
                 </span>
             </label>
             <textarea 
                rows={4}
                value={edgeInput}
                onChange={(e) => setEdgeInput(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                placeholder="0-1, 0-2, 1-3, 1-4"
             />
             <div className="mt-2">
                 <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                     根节点 (Root Node)
                 </label>
                 <input 
                    type="number"
                    value={startNode}
                    onChange={(e) => setStartNode(parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                 />
             </div>
             <button 
                onClick={handleUpdateGraph}
                className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
             >
                 更新树结构
             </button>
         </div>

         <button 
            onClick={handleRandomGraph}
            className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all hover:border-solid ${isDark ? 'border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600'}`}
         >
             <ArrowPathRoundedSquareIcon className="w-5 h-5" />
             <span>随机生成二叉树</span>
         </button>
      </div>

      {/* Center Panel: Visualization & Controls (6 cols) */}
      <div className={`xl:col-span-6 rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>树形演示 (Visualization)</h2>
        
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
                    <option value="1500">慢</option>
                    <option value="800">中</option>
                    <option value="300">快</option>
                </select>
            </div>
        </div>

        {/* Visualization Area (SVG) */}
        <div className={`flex items-center justify-center p-4 border rounded-lg overflow-hidden ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-slate-200'}`}>
            <svg width="100%" height="400" viewBox="0 0 600 400" className="w-full h-auto">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={isDark ? "#9ca3af" : "#64748b"} />
                    </marker>
                </defs>
                
                {/* Edges */}
                {edges.map((edge, idx) => {
                    const startNode = nodes.find(n => n.id === edge.source);
                    const endNode = nodes.find(n => n.id === edge.target);
                    if (!startNode || !endNode) return null;

                    // Highlight edge if it's the current path being traversed
                    const isHighlighted = currentInfo.highlightedEdge && 
                        currentInfo.highlightedEdge.source === edge.source && 
                        currentInfo.highlightedEdge.target === edge.target;
                    
                    return (
                        <line 
                            key={`edge-${idx}`}
                            x1={startNode.x}
                            y1={startNode.y}
                            x2={endNode.x}
                            y2={endNode.y}
                            stroke={isHighlighted ? '#f59e0b' : (isDark ? '#4b5563' : '#cbd5e1')}
                            strokeWidth={isHighlighted ? 4 : 2}
                            markerEnd="url(#arrowhead)"
                            className="transition-all duration-300"
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                    const isVisited = currentInfo.visited.includes(node.id);
                    const isCurrent = currentInfo.currentNode === node.id;
                    
                    let fill = isDark ? '#374151' : '#e2e8f0'; // Default
                    let stroke = isDark ? '#6b7280' : '#94a3b8';
                    let strokeWidth = 2;

                    if (isVisited) {
                        fill = isDark ? '#065f46' : '#d1fae5'; // Greenish
                        stroke = isDark ? '#34d399' : '#10b981';
                    }

                    if (isCurrent) {
                        fill = '#f59e0b'; // Orange
                        stroke = '#b45309';
                        strokeWidth = 3;
                    }

                    return (
                        <g key={`node-${node.id}`} className="transition-all duration-500">
                            <circle 
                                cx={node.x} 
                                cy={node.y} 
                                r={isCurrent ? 25 : 20} 
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={strokeWidth}
                                className="transition-all duration-300"
                            />
                            <text 
                                x={node.x} 
                                y={node.y} 
                                dy=".35em" 
                                textAnchor="middle" 
                                className={`text-sm font-bold pointer-events-none ${isCurrent ? 'fill-white' : (isDark ? 'fill-gray-200' : 'fill-slate-700')}`}
                            >
                                {node.id}
                            </text>
                        </g>
                    );
                })}
            </svg>
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
                            {currentInfo.action === 'traverse_left' ? '遍历左子树' : 
                             currentInfo.action === 'visit' ? '访问节点' : 
                             currentInfo.action === 'traverse_right' ? '遍历右子树' : 
                             currentInfo.action === 'return' ? '返回父节点' : '准备中'}
                        </p>
                    </div>

                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
                        <p className={`${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                            {currentInfo.description}
                        </p>
                    </div>
                    
                    {/* Traversal Sequence Result */}
                    <div>
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>中序序列 (Inorder Sequence):</p>
                        <div className={`flex flex-wrap gap-2 p-2 rounded-lg min-h-[40px] ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                            {currentInfo.visited.length > 0 ? currentInfo.visited.map((nodeId, idx) => (
                                <div key={idx} className="flex items-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                                        {nodeId}
                                    </span>
                                    {idx < currentInfo.visited.length - 1 && <span className="mx-1 text-gray-400">,</span>}
                                </div>
                            )) : <span className="text-gray-500 text-xs italic">空 (Empty)</span>}
                        </div>
                    </div>

                    {/* Stack Visualization */}
                    <div>
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>递归栈 (Recursion Stack):</p>
                        <div className={`flex flex-wrap gap-2 p-2 rounded-lg min-h-[40px] ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                            {currentInfo.stack.length > 0 ? currentInfo.stack.map((nodeId, idx) => (
                                <div key={idx} className="flex items-center">
                                    <span className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
                                        {nodeId}
                                    </span>
                                    {idx < currentInfo.stack.length - 1 && <span className="mx-1 text-gray-400">→</span>}
                                </div>
                            )) : <span className="text-gray-500 text-xs italic">空 (Empty)</span>}
                        </div>
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

export default BinaryTreeComponent;
