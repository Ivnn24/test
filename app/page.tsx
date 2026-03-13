"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, CheckCircle, Circle, Pencil, Save, 
  ListTodo, CheckCheck, Clock, X, LayoutDashboard,
  Search, Briefcase, User, Heart, ShoppingCart, Tag,
  Zap, Coffee, Timer, ChevronRight, ChevronDown, Calendar,
  Play, Pause, RotateCcw, Sparkles, Command, LucideIcon
} from 'lucide-react';

// --- TYPES & MODELS ---
type Priority = 'low' | 'medium' | 'high';
type Category = 'work' | 'personal' | 'health' | 'shopping';
type Energy = 'low' | 'high';

interface SubTask {
  id: number;
  text: string;
  completed: boolean;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  energy: Energy;
  dueDate: string;
  subTasks: SubTask[];
  createdAt: string;
}

type FilterType = 'all' | 'pending' | 'completed';

interface CategoryConfig {
  id: Category;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'work', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'personal', icon: User, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'health', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 'shopping', icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
];

export default function SimplyTask() {
  // --- STATE ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [energy, setEnergy] = useState<Energy>('high');
  const [dueDate, setDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('simply-task-ultra-v5');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('simply-task-ultra-v5', JSON.stringify(tasks));
  }, [tasks]);

  // --- TIMER LOGIC (Fixed Interval) ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Add notification sound here
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // --- HANDLERS ---
  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const newTask: Task = {
      id: Date.now(),
      text: input,
      completed: false,
      priority,
      category,
      energy,
      dueDate: dueDate || "No date",
      subTasks: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTasks([newTask, ...tasks]);
    setInput("");
    setDueDate("");
  };

  const addSubTask = (taskId: number, text: string) => {
    if (!text.trim()) return;
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, subTasks: [...t.subTasks, { id: Date.now(), text, completed: false }]
    } : t));
  };

  const toggleComplete = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteSingleTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- DERIVED STATE ---
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const pMap = { high: 1, medium: 2, low: 3 };
        return pMap[a.priority] - pMap[b.priority];
      });
  }, [tasks, searchQuery, filter]);

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.completed).length,
    percent: tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-[#3ecf8e] selection:text-black">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3ecf8e]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto p-4 md:p-12 space-y-10">
        
        {/* NAV / HEADER */}
        <nav className="flex items-center justify-between border-b border-[#1f1f1f] pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1f1f1f] rounded-lg border border-[#2e2e2e]">
              <Command size={20} className="text-[#3ecf8e]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SimplyTask</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-indigo-500 flex items-center justify-center text-[10px] font-bold">JD</div>
               <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-[#3ecf8e] flex items-center justify-center text-[10px] text-black font-bold">AI</div>
            </div>
          </div>
        </nav>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-[#171717] border border-[#2e2e2e] rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'border-[#3ecf8e] text-[#3ecf8e] animate-pulse' : 'border-[#2e2e2e] text-[#666]'}`}>
                <Timer size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Session Timer</p>
                <h2 className="text-3xl font-mono font-medium tracking-tighter">{formatTime(timeLeft)}</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsActive(!isActive)} className="px-4 py-2 bg-[#2e2e2e] hover:bg-[#3e3e3e] border border-[#3e3e3e] rounded-lg transition-all text-sm font-medium">
                {isActive ? 'Pause' : 'Resume'}
              </button>
              <button onClick={() => {setIsActive(false); setTimeLeft(1500)}} className="p-2 text-[#666] hover:text-white transition-colors">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-6 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Tasks Finished</p>
                <h2 className="text-3xl font-medium tracking-tighter">{stats.done}<span className="text-sm text-[#666] ml-2">/ {stats.total}</span></h2>
             </div>
             <div className="absolute bottom-0 left-0 h-1 bg-[#3ecf8e] transition-all duration-500" style={{width: `${stats.percent}%`}} />
          </div>

          <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-6 flex items-center justify-center">
             <button className="flex items-center gap-2 text-sm font-medium text-[#3ecf8e] hover:opacity-80 transition-opacity">
                <Sparkles size={16}/> Upgrade to Pro
             </button>
          </div>
        </div>

        {/* MAIN TASK INTERFACE */}
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden">
          
          <div className="p-4 border-b border-[#2e2e2e] bg-[#1a1a1a] flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#2e2e2e]">
               {['all', 'pending', 'completed'].map(f => (
                 <button key={f} onClick={() => setFilter(f as FilterType)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${filter === f ? 'bg-[#2e2e2e] text-white shadow-sm' : 'text-[#666] hover:text-[#ededed]'}`}>
                   {f}
                 </button>
               ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" size={14} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg outline-none focus:border-[#3ecf8e] transition-all text-xs"
              />
            </div>
          </div>

          <div className="p-8 border-b border-[#2e2e2e]">
            <form onSubmit={addTask} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 border-b border-[#2e2e2e] focus-within:border-[#3ecf8e] transition-all pb-2">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a new task name..."
                    className="w-full bg-transparent text-xl font-medium outline-none placeholder:text-[#444]"
                  />
                </div>
                <button type="submit" className="bg-[#3ecf8e] text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2">
                  <Plus size={18}/> New Task
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#666] uppercase tracking-tighter">Due</span>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent text-[#ededed] text-xs font-medium outline-none border border-[#2e2e2e] p-1.5 rounded" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#666] uppercase tracking-tighter">Priority</span>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="bg-transparent text-[#ededed] text-xs font-medium outline-none cursor-pointer">
                    <option className="bg-[#1a1a1a]" value="low">Low</option>
                    <option className="bg-[#1a1a1a]" value="medium">Medium</option>
                    <option className="bg-[#1a1a1a]" value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#666] uppercase tracking-tighter">Category</span>
                  <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`p-2 rounded-lg border transition-all ${category === cat.id ? `${cat.bg} ${cat.color} ${cat.border}` : 'bg-transparent border-[#2e2e2e] text-[#666]'}`}>
                        <cat.icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button type="button" onClick={() => setEnergy('high')} className={`p-1.5 rounded border transition-all ${energy === 'high' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-[#444] border-[#2e2e2e]'}`}><Zap size={14}/></button>
                  <button type="button" onClick={() => setEnergy('low')} className={`p-1.5 rounded border transition-all ${energy === 'low' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' : 'text-[#444] border-[#2e2e2e]'}`}><Coffee size={14}/></button>
                </div>
              </div>
            </form>
          </div>

          <div className="divide-y divide-[#2e2e2e]">
            {filteredTasks.length > 0 ? filteredTasks.map((task) => {
              const cat = CATEGORIES.find(c => c.id === task.category);
              const isExpanded = expandedId === task.id;

              return (
                <div key={task.id} className={`group hover:bg-[#1a1a1a] transition-all ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="px-8 py-5 flex items-center gap-6">
                    <button 
                      onClick={() => toggleComplete(task.id)} 
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-[#3ecf8e] border-[#3ecf8e] text-black' : 'border-[#2e2e2e] hover:border-[#3ecf8e]'}`}
                    >
                      {task.completed && <CheckCheck size={14} />}
                    </button>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : task.id)}>
                      <div className="md:col-span-2">
                        <h3 className={`text-sm font-medium tracking-tight ${task.completed ? 'line-through text-[#666]' : 'text-[#ededed]'}`}>{task.text}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-[#2e2e2e] text-[#666]'}`}>{task.priority.toUpperCase()}</span>
                          <span className="text-[9px] text-[#666] flex items-center gap-1 font-mono uppercase tracking-tighter"><Calendar size={10}/> {task.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {cat && (
                           <>
                             <div className={`p-1.5 rounded-md ${cat.bg} ${cat.color} border ${cat.border}`}>
                               <cat.icon size={12}/>
                             </div>
                             <span className="text-[10px] font-bold text-[#666] uppercase">{task.category}</span>
                           </>
                         )}
                      </div>
                      <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); deleteSingleTask(task.id); }} className="text-[#666] hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        {isExpanded ? <ChevronDown size={16} className="text-[#3ecf8e]" /> : <ChevronRight size={16} className="text-[#666]" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-20 pb-8 space-y-4">
                      <div className="h-px bg-[#2e2e2e] w-full mb-6" />
                      {task.subTasks.map(st => (
                        <div key={st.id} className="flex items-center gap-3">
                          <button onClick={() => {
                            setTasks(prev => prev.map(t => t.id === task.id ? {
                              ...t, subTasks: t.subTasks.map(s => s.id === st.id ? {...s, completed: !s.completed} : s)
                            } : t))
                          }} className={`w-4 h-4 rounded border flex items-center justify-center ${st.completed ? 'bg-[#3ecf8e] border-[#3ecf8e] text-black' : 'border-[#2e2e2e]'}`}>
                            {st.completed && <CheckCheck size={10} />}
                          </button>
                          <span className={`text-xs ${st.completed ? 'line-through text-[#444]' : 'text-[#999]'}`}>{st.text}</span>
                        </div>
                      ))}
                      <input 
                        onKeyDown={(e) => {
                          if(e.key === 'Enter') {
                            addSubTask(task.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                        placeholder="Add a sub-step and press Enter..." 
                        className="w-full bg-[#0a0a0a] border border-[#2e2e2e] rounded-md px-4 py-2 text-xs outline-none focus:border-[#3ecf8e] text-[#ededed]"
                      />
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="py-20 flex flex-col items-center justify-center text-[#444] bg-[#121212]">
                <ListTodo size={40} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No tasks found.</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Start by adding a new goal above</p>
              </div>
            )}
          </div>
        </div>

        <footer className="flex items-center justify-between pt-10 border-t border-[#1f1f1f] text-[#444]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">SimplyTask</p>
          <div className="flex gap-4 text-[10px] font-medium uppercase tracking-widest">
            <span className="hover:text-[#3ecf8e] cursor-pointer">Documentation</span>
            <span className="hover:text-[#3ecf8e] cursor-pointer">Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
}