import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  PlusCircle, 
  X, 
  Check, 
  Loader2, 
  ClipboardList,
  Search,
  SlidersHorizontal,
  Sun,
  Moon,
  Activity,
  User,
  Users,
  Calendar,
  Download,
  Upload,
  BarChart3,
  CheckSquare,
  Sparkles,
  Inbox,
  LifeBuoy,
  Terminal,
  Settings,
  Menu
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.port && window.location.port !== '5000'
  ? 'http://localhost:5000/api'
  : '/api');

// Static Assignees Data for professional Agile workspace feel
const DEFAULT_ASSIGNEES = [
  { id: 'usr-1', name: 'Amit Sharma', initials: 'AS', color: 'from-orange-400 to-amber-500 bg-gradient-to-br text-white' },
  { id: 'usr-2', name: 'John Doe', initials: 'JD', color: 'from-purple-500 to-indigo-600 bg-gradient-to-br text-white' },
  { id: 'usr-3', name: 'Sophia Lee', initials: 'SL', color: 'from-emerald-400 to-teal-500 bg-gradient-to-br text-white' },
  { id: 'usr-4', name: 'Sarah Patel', initials: 'SP', color: 'from-rose-400 to-pink-500 bg-gradient-to-br text-white' },
  { id: 'usr-5', name: 'Kabir Dev', initials: 'KD', color: 'from-cyan-400 to-blue-500 bg-gradient-to-br text-white' }
];

const GRADIENT_COLORS = [
  'from-orange-400 to-amber-500 bg-gradient-to-br text-white',
  'from-purple-500 to-indigo-600 bg-gradient-to-br text-white',
  'from-emerald-400 to-teal-500 bg-gradient-to-br text-white',
  'from-rose-400 to-pink-500 bg-gradient-to-br text-white',
  'from-cyan-400 to-blue-500 bg-gradient-to-br text-white',
  'from-indigo-500 to-purple-650 bg-gradient-to-br text-white',
  'from-fuchsia-500 to-pink-650 bg-gradient-to-br text-white',
  'from-lime-400 to-emerald-500 bg-gradient-to-br text-white'
];

export default function App() {
  const [assignees, setAssignees] = useState(() => {
    const saved = localStorage.getItem('apex_task_assignees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ASSIGNEES;
  });

  const ASSIGNEES = assignees;

  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const words = newMemberName.trim().split(/\s+/);
    let initials = '';
    if (words.length > 0) {
      if (words.length === 1) {
        initials = words[0].substring(0, 2).toUpperCase();
      } else {
        initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
      }
    }

    const color = GRADIENT_COLORS[assignees.length % GRADIENT_COLORS.length];
    
    const newMember = {
      id: `usr-${Date.now()}`,
      name: newMemberName.trim(),
      initials,
      color
    };

    const updated = [...assignees, newMember];
    setAssignees(updated);
    localStorage.setItem('apex_task_assignees', JSON.stringify(updated));
    setNewMemberName('');
    addToast(`👥 Team member "${newMember.name}" added successfully!`);
  };

  const handleRemoveMember = (id) => {
    if (assignees.length <= 1) {
      addToast("⚠️ Workspace must have at least 1 active team member!", "error");
      return;
    }

    const memberToRemove = assignees.find(u => u.id === id);
    const updated = assignees.filter(u => u.id !== id);
    setAssignees(updated);
    localStorage.setItem('apex_task_assignees', JSON.stringify(updated));
    if (memberToRemove) {
      addToast(`🗑️ Team member "${memberToRemove.name}" removed.`);
    }
  };

  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [reviewerFilter, setReviewerFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Live Toasts State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState('');
  
  // Form states for new task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newStoryPoints, setNewStoryPoints] = useState(1);
  const [newCategory, setNewCategory] = useState('Feature');
  const [newAssigneeId, setNewAssigneeId] = useState('usr-1');
  const [newFrontendDevId, setNewFrontendDevId] = useState('usr-1');
  const [newBackendDevId, setNewBackendDevId] = useState('usr-3');
  const [newQaDevId, setNewQaDevId] = useState('usr-4');
  const [newReviewerId, setNewReviewerId] = useState('usr-2');
  const [newDueDate, setNewDueDate] = useState('');
  
  // New column state
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  // Live Activity Logs State
  const [logs, setLogs] = useState([]);

  // Dynamic Confetti State
  const [confetti, setConfetti] = useState([]);

  // Custom Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { type: 'task' | 'column', id: string, title: string }

  // Developer Console Collapsible State
  const [showDevConsole, setShowDevConsole] = useState(false);

  // File input ref for import
  const fileInputRef = useRef(null);

  // Support Desk Widget States
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTitle, setSupportTitle] = useState('');
  const [supportDesc, setSupportDesc] = useState('');
  const [supportCategory, setSupportCategory] = useState('Bug');
  const [supportPriority, setSupportPriority] = useState('medium');

  // Theme state: defaults to light theme (smooth) as requested
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('apex-theme');
    return saved ? saved === 'dark' : false;
  });

  // Theme and Body Class Sync
  useEffect(() => {
    localStorage.setItem('apex-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.className = 'bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden transition-colors duration-300';
    } else {
      document.body.className = 'bg-slate-550 text-slate-800 font-sans antialiased overflow-x-hidden transition-colors duration-300';
    }
  }, [isDark]);

  // Live Log Helper
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setLogs(prev => [{ id: uniqueId, text: message, time: timestamp }, ...prev].slice(0, 15));
    addToast(message, 'success');
  };

  // Dynamic Confetti Particle Explosion Trigger
  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: `conf-${Date.now()}-${i}`,
      x: Math.random() * 100, // percentage width across screen
      y: -10, // starts offscreen top
      color: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 6)],
      size: Math.random() * 8 + 6,
      delay: Math.random() * 0.4,
      duration: Math.random() * 1.5 + 1.2
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  // Fetch initial board state
  const fetchBoard = async (signal) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/board`, { signal });
      if (!res.ok) throw new Error('Failed to fetch board data');
      const data = await res.json();
      setColumns(data.columns);
      
      // Ensure all tasks have storyPoints, category, assigneeId, reviewerId, isApproved and dueDate
      const cleanedTasks = data.tasks.map((t, idx) => ({
        ...t,
        ticketId: t.ticketId || `APEX-${idx + 101}`,
        storyPoints: t.storyPoints || 1,
        category: t.category || 'Feature',
        assigneeId: t.assigneeId || ASSIGNEES[idx % ASSIGNEES.length].id,
        frontendDevId: t.frontendDevId || t.assigneeId || ASSIGNEES[idx % ASSIGNEES.length].id,
        backendDevId: t.backendDevId || ASSIGNEES[(idx + 2) % ASSIGNEES.length].id,
        qaDevId: t.qaDevId || ASSIGNEES[(idx + 3) % ASSIGNEES.length].id,
        reviewerId: t.reviewerId || ASSIGNEES[(idx + 1) % ASSIGNEES.length].id,
        isApproved: t.isApproved || false,
        dueDate: t.dueDate || ''
      }));
      setTasks(cleanedTasks);
      setServerError(false);
      addLog("🚀 Dashboard connected and synced with local DB.");
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setServerError(true);
        addLog("❌ Database connection error. Check server!");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchBoard(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, destColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistic UI update
    const originalTasks = [...tasks];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || tasks[taskIndex].columnId === destColumnId) return;

    const task = tasks[taskIndex];
    const sourceCol = columns.find(c => c.id === task.columnId)?.title || 'Unknown';
    const destCol = columns.find(c => c.id === destColumnId)?.title || 'Unknown';

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], columnId: destColumnId };
    setTasks(updatedTasks);

    // Check if task completed (dropped into Done column)
    const isDoneColumn = destColumnId === 'col-done' || 
                         destColumnId === columns[columns.length - 1]?.id ||
                         destCol.toLowerCase().includes('done') || 
                         destCol.toLowerCase().includes('complete');

    if (isDoneColumn) {
      triggerConfetti();
      addLog(`🎉 Completed: "${task.title}" shifted to Done!`);
    } else {
      addLog(`🔄 Shifted: "${task.title}" from [${sourceCol}] ➔ [${destCol}]`);
    }

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: destColumnId })
      });
      if (!res.ok) throw new Error('Failed to update task column in DB');
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
      addLog(`❌ Failed sync: "${task.title}" reverted`);
    }
  };

  // Add Task Handler
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const taskPayload = {
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      columnId: targetColumnId,
      subtasks: [],
      storyPoints: Number(newStoryPoints) || 1,
      category: newCategory,
      assigneeId: newAssigneeId,
      frontendDevId: newFrontendDevId,
      backendDevId: newBackendDevId,
      qaDevId: newQaDevId,
      reviewerId: newReviewerId,
      isApproved: false,
      dueDate: newDueDate
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      if (!res.ok) throw new Error('Failed to create task');
      const savedTask = await res.json();
      
      // Ensure defaults inside local state
      const taskWithDefaults = {
        ...savedTask,
        ticketId: savedTask.ticketId || `APEX-${Date.now()}`,
        storyPoints: savedTask.storyPoints || 1,
        category: savedTask.category || 'Feature',
        assigneeId: savedTask.assigneeId || 'usr-1',
        frontendDevId: savedTask.frontendDevId || 'usr-1',
        backendDevId: savedTask.backendDevId || 'usr-3',
        qaDevId: savedTask.qaDevId || 'usr-4',
        reviewerId: savedTask.reviewerId || 'usr-2',
        isApproved: savedTask.isApproved || false,
        dueDate: savedTask.dueDate || ''
      };
      
      setTasks(prev => [...prev, taskWithDefaults]);
      addLog(`➕ Created Task: "${savedTask.title}"`);
      
      // Reset and close
      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
      setNewStoryPoints(1);
      setNewCategory('Feature');
      setNewAssigneeId('usr-1');
      setNewFrontendDevId('usr-1');
      setNewBackendDevId('usr-3');
      setNewQaDevId('usr-4');
      setNewReviewerId('usr-2');
      setNewDueDate('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Error creating task.');
    }
  };

  // Support Helpdesk Ticket Submit Handler
  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!supportTitle.trim()) return;

    const taskPayload = {
      title: `[SUPPORT] ${supportTitle}`,
      description: supportDesc || 'Client Hotfix Support Ticket.',
      priority: supportPriority,
      columnId: columns[0]?.id || 'col-todo',
      subtasks: [],
      storyPoints: supportCategory === 'Bug' ? 3 : 1,
      category: supportCategory,
      assigneeId: 'usr-4', // defaults to QA/Support Lead
      frontendDevId: 'usr-1',
      backendDevId: 'usr-3',
      qaDevId: 'usr-4',
      reviewerId: 'usr-2',
      isApproved: false,
      dueDate: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      if (!res.ok) throw new Error('Failed to submit support ticket');
      const savedTask = await res.json();
      
      const taskWithDefaults = {
        ...savedTask,
        ticketId: savedTask.ticketId || `APEX-${Date.now()}`,
        storyPoints: savedTask.storyPoints || 1,
        category: savedTask.category || 'Feature',
        assigneeId: savedTask.assigneeId || 'usr-4',
        frontendDevId: savedTask.frontendDevId || 'usr-1',
        backendDevId: savedTask.backendDevId || 'usr-3',
        qaDevId: savedTask.qaDevId || 'usr-4',
        reviewerId: savedTask.reviewerId || 'usr-2',
        isApproved: false,
        dueDate: savedTask.dueDate || ''
      };
      
      setTasks(prev => [...prev, taskWithDefaults]);
      addLog(`🎫 Support Ticket "${savedTask.ticketId}" Lodged Successfully!`);
      
      // Trigger dynamic confetti feedback
      triggerConfetti();

      // Reset
      setSupportTitle('');
      setSupportDesc('');
      setSupportCategory('Bug');
      setSupportPriority('medium');
      setShowSupportModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit support ticket.');
    }
  };

  // Update Task detail
  const handleUpdateTaskDetail = async (taskId, updatedFields) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedFields } : t));
    
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({ ...prev, ...updatedFields }));
    }

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) throw new Error('Failed to update task');
      if (updatedFields.title || updatedFields.priority || updatedFields.storyPoints || updatedFields.category || updatedFields.assigneeId || updatedFields.dueDate !== undefined) {
        addLog(`✏️ Edited Task Fields: ID [${taskId.substring(0, 8)}]`);
      }
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
    }
  };

  // Delete Task Initiator
  const initDeleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setDeleteConfirmation({
      type: 'task',
      id: taskId,
      title: task.title
    });
  };

  // Actual Delete Task Executor
  const executeDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
    setDeleteConfirmation(null);
    addLog(`🗑️ Removed Task: "${taskToDelete.title}"`);

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
    }
  };

  // Add Column Handler
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newColTitle })
      });
      if (!res.ok) throw new Error('Failed to create column');
      const savedCol = await res.json();
      setColumns(prev => [...prev, savedCol]);
      addLog(`📁 Created Board Column: "${savedCol.title}"`);
      setNewColTitle('');
      setShowAddColumnInput(false);
    } catch (err) {
      console.error(err);
      alert('Error creating column.');
    }
  };

  // Delete Column Initiator
  const initDeleteColumn = (colId, title) => {
    setDeleteConfirmation({
      type: 'column',
      id: colId,
      title: title
    });
  };

  // Actual Delete Column Executor
  const executeDeleteColumn = async (colId, title) => {
    const originalColumns = [...columns];
    const originalTasks = [...tasks];

    setColumns(prev => prev.filter(c => c.id !== colId));
    setTasks(prev => prev.filter(t => t.columnId !== colId));
    setDeleteConfirmation(null);
    addLog(`🗑️ Removed Column: "${title}" (Cleaned up child tasks)`);

    try {
      const res = await fetch(`${API_BASE}/columns/${colId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete column');
    } catch (err) {
      console.error(err);
      setColumns(originalColumns);
      setTasks(originalTasks);
    }
  };

  // Toggle Subtask Completion
  const toggleSubtask = (task, subtaskId) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    handleUpdateTaskDetail(task.id, { subtasks: updatedSubtasks });
    const sub = task.subtasks.find(s => s.id === subtaskId);
    addLog(`☑️ Subtask [${sub?.title.substring(0, 15)}...] toggled.`);
  };

  // Add New Subtask
  const handleAddSubtask = (task, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: subtaskTitle,
      completed: false
    };
    const updatedSubtasks = [...task.subtasks, newSub];
    handleUpdateTaskDetail(task.id, { subtasks: updatedSubtasks });
    addLog(`➕ Added subtask: "${subtaskTitle.substring(0, 15)}..."`);
  };

  // Export Backup File Handler (JSON download)
  const handleExportWorkspace = () => {
    try {
      const exportData = {
        columns,
        tasks
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = 'apextask-workspace-backup.json';
      
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
      }, 100);
      
      addLog(`💾 Exported workspace backup file.`);
    } catch (err) {
      console.error(err);
      alert('Error exporting backup.');
    }
  };

  // Export Board Data to Excel (CSV format)
  const handleExportExcel = () => {
    try {
      // Header row
      const headers = ['Task ID', 'Title', 'Description', 'Column/Status', 'Category', 'Story Points', 'Priority', 'Assignee Name', 'Due Date', 'Subtasks Completed', 'Total Subtasks'];
      
      // Map tasks to CSV rows
      const rows = tasks.map(task => {
        const colTitle = columns.find(c => c.id === task.columnId)?.title || 'Unknown';
        const assigneeName = ASSIGNEES.find(u => u.id === task.assigneeId)?.name || 'Unassigned';
        const totalSubs = task.subtasks?.length || 0;
        const doneSubs = task.subtasks?.filter(s => s.completed).length || 0;
        
        // Clean text to avoid breaking CSV format
        const cleanTitle = (task.title || '').replace(/"/g, '""');
        const cleanDesc = (task.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const cleanCol = colTitle.replace(/"/g, '""');
        
        return [
          task.id,
          `"${cleanTitle}"`,
          `"${cleanDesc}"`,
          `"${cleanCol}"`,
          task.category || 'Feature',
          task.storyPoints || 1,
          task.priority || 'medium',
          `"${assigneeName}"`,
          task.dueDate || 'No Date',
          doneSubs,
          totalSubs
        ];
      });
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');
      
      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = 'apextask-board-report.csv';
      
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
      }, 100);

      addLog(`📊 Exported board spreadsheet for Microsoft Excel.`);
    } catch (err) {
      console.error(err);
      alert('Error exporting Excel report.');
    }
  };

  // Import Backup File Parser & Database Synchronizer
  const handleImportWorkspace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (!parsedData.columns || !parsedData.tasks || !Array.isArray(parsedData.columns) || !Array.isArray(parsedData.tasks)) {
          throw new Error('Invalid JSON file format. Must contain columns and tasks.');
        }

        setLoading(true);
        const res = await fetch(`${API_BASE}/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData)
        });

        if (!res.ok) throw new Error('Failed to import into database');
        const updatedDb = await res.json();
        
        // Clean up imported task schemas
        const cleanedTasks = updatedDb.tasks.map((t, idx) => ({
          ...t,
          ticketId: t.ticketId || `APEX-${idx + 101}`,
          storyPoints: t.storyPoints || 1,
          category: t.category || 'Feature',
          assigneeId: t.assigneeId || ASSIGNEES[idx % ASSIGNEES.length].id,
          frontendDevId: t.frontendDevId || t.assigneeId || ASSIGNEES[idx % ASSIGNEES.length].id,
          backendDevId: t.backendDevId || ASSIGNEES[(idx + 2) % ASSIGNEES.length].id,
          qaDevId: t.qaDevId || ASSIGNEES[(idx + 3) % ASSIGNEES.length].id,
          reviewerId: t.reviewerId || ASSIGNEES[(idx + 1) % ASSIGNEES.length].id,
          isApproved: t.isApproved || false,
          dueDate: t.dueDate || ''
        }));
        
        setColumns(updatedDb.columns);
        setTasks(cleanedTasks);
        addLog(`📥 Restored board state from JSON backup!`);
      } catch (err) {
        console.error(err);
        alert(`Failed to restore backup: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fileReader.readAsText(file);
  };

  // Date Checker for Overdue Reminders Engine
  const isOverdue = (dueDate, colId) => {
    if (!dueDate) return false;
    const isDoneCol = colId === 'col-done' || 
                      columns.find(c => c.id === colId)?.title.toLowerCase().includes('done') ||
                      columns.find(c => c.id === colId)?.title.toLowerCase().includes('complete');
    if (isDoneCol) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Helper for dynamic column color indicators (Notion/Linear Style)
  const getColumnStyleDetails = (colTitle) => {
    const t = colTitle.toLowerCase();
    if (t.includes('todo') || t.includes('to do')) {
      return { bullet: 'bg-indigo-500 shadow-indigo-500/20', accent: 'bg-indigo-500' };
    }
    if (t.includes('progress') || t.includes('active')) {
      return { bullet: 'bg-amber-500 shadow-amber-500/20', accent: 'bg-amber-500' };
    }
    if (t.includes('done') || t.includes('complete')) {
      return { bullet: 'bg-emerald-500 shadow-emerald-500/20', accent: 'bg-emerald-500' };
    }
    return { bullet: 'bg-purple-500 shadow-purple-500/20', accent: 'bg-purple-500' };
  };

  // Portfolio Dashboard Stats calculations
  const totalTasks = tasks.length;
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const doneColumnId = columns[columns.length - 1]?.id;
  const completedStoryPoints = tasks
    .filter(t => t.columnId === doneColumnId || columns.find(c => c.id === t.columnId)?.title.toLowerCase().includes('done'))
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const completedTasksCount = tasks.filter(t => t.columnId === doneColumnId || columns.find(c => c.id === t.columnId)?.title.toLowerCase().includes('done')).length;
  const completedPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Overdue count
  const overdueCount = tasks.filter(t => isOverdue(t.dueDate, t.columnId)).length;

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    } font-sans transition-colors duration-300`}>
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 1. LEFT SIDEBAR PANEL (GLOWING APP SIDEBAR) */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-80 md:flex flex-col justify-between border-r ${
        isDark ? 'bg-slate-900 border-slate-900 text-slate-300' : 'bg-white border-slate-200 shadow-xl md:shadow-none'
      } z-50 transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isMobileSidebarOpen ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Sidebar Header Title */}
        <div className="p-6 border-b border-inherit space-y-4 relative">
          {/* Close button for mobile views */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg border border-slate-500/10 hover:bg-slate-500/5 cursor-pointer text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ClipboardList className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                ApexTask Pro
              </h1>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-550' : 'text-slate-400'}`}>Full-Stack SaaS Management</p>
            </div>
          </div>

          {/* Connected Live Database Ping badge */}
          <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-[10px] font-bold ${
            isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-55 bg-slate-50 border-slate-150'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${serverError ? 'bg-rose-500' : 'bg-emerald-500 bg-gradient-to-r from-emerald-400 to-teal-500'} ${serverError ? 'animate-pulse' : 'animate-ping'}`} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-650'}>
                {serverError 
                  ? 'Server Offline' 
                  : (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1') 
                      ? 'Local Database Active' 
                      : 'MongoDB Cloud Active')}
              </span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[8px] uppercase tracking-wider font-mono">v1.4</span>
          </div>
        </div>

        {/* Workspace Agile Statistics Widget */}
        <div className="px-6 py-4 border-b border-inherit space-y-3.5 text-left">
          <div className="flex items-center justify-between">
            <h3 className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>AGILE VELOCITY</h3>
            <button
              onClick={() => setShowAnalytics(true)}
              className="text-[9px] font-black text-indigo-500 hover:text-indigo-650 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <BarChart3 className="h-3 w-3" />
              View Insights
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'} text-left`}>
              <p className={`text-[9px] font-bold ${isDark ? 'text-slate-550' : 'text-slate-400'}`}>Total Cards</p>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-xl font-extrabold font-mono tracking-tight">{totalTasks}</span>
                <span className="text-[10px] text-slate-400 font-medium">active</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'} text-left`}>
              <p className={`text-[9px] font-bold ${isDark ? 'text-slate-555' : 'text-slate-400'}`}>Velocity Points</p>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-xl font-extrabold font-mono tracking-tight text-indigo-550">{completedStoryPoints}</span>
                <span className={`text-[10px] ${isDark ? 'text-slate-550' : 'text-slate-450'} font-medium`}>/ {totalStoryPoints}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sprint Progress & Active Team Collaborators */}
        <div className="flex-1 p-6 space-y-6 text-left overflow-y-auto">
          {/* Sprint progress card */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDark ? 'bg-slate-950/20 border-slate-900/60' : 'bg-slate-50/50 border-slate-150'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Sprint</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase font-mono tracking-wide">Sprint 1.4</span>
            </div>
            <h4 className="text-xs font-black tracking-tight mb-2.5">🚀 SaaS Launch Sprint</h4>
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-black">
                <span className={isDark ? 'text-slate-450' : 'text-slate-500'}>Progress</span>
                <span className="text-indigo-550 font-mono">{completedPercent}%</span>
              </div>
              <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-150'}`}>
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${completedPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Team Collaborators block */}
          <div className="space-y-3">
            <h4 className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Workspace Team</h4>
            <div className="flex items-center gap-4">
              {/* Overlapping glowing initials avatars */}
              <div className="flex -space-x-2.5">
                {ASSIGNEES.map((u, idx) => (
                  <div 
                    key={u.id} 
                    className={`h-7.5 w-7.5 rounded-full border-2 ${
                      isDark ? 'border-slate-950' : 'border-white'
                    } flex items-center justify-center text-[9px] font-black tracking-tighter shadow-md hover:scale-110 active:scale-95 transition-transform duration-300 select-none cursor-pointer ${u.color}`}
                    title={u.name}
                    style={{ zIndex: 10 + idx }}
                  >
                    {u.initials}
                  </div>
                ))}
              </div>
              
              <div className="text-left leading-normal">
                <p className="text-[10px] font-black tracking-tight">5 Active Devs</p>
                <p className={`text-[8px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Syncing with live cloud</p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Switch & Sidebar Footer */}
        <div className="p-6 border-t border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Portfolio View</span>
          </div>

          {/* Theme Switch Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer ${
              isDark 
                ? 'bg-slate-950 border-slate-900 text-amber-400 hover:bg-slate-900' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm'
            } transition-all duration-300 font-bold text-xs`}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span className="text-[9px] uppercase font-bold tracking-wide">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span className="text-[9px] uppercase font-bold tracking-wide">Dark</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN SYSTEM DASHBOARD AREA (RIGHT PANEL) */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        
        {/* Dynamic Top Navbar with filters */}
        <nav className={`px-4 md:px-8 py-5 border-b flex flex-col xl:flex-row xl:items-center justify-between gap-4 z-20 transition-colors duration-300 ${
          isDark ? 'bg-slate-950/80 border-slate-900 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-800'
        } backdrop-blur-md`}>
          
          {/* Quick Search & Mobile Menu Button */}
          <div className="flex items-center gap-2.5 w-full max-w-xs">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden flex items-center justify-center p-2.5 border rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200' 
                  : 'bg-slate-50 border-slate-150 text-slate-655 hover:bg-slate-100 shadow-sm'
              }`}
              title="Open Navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="relative w-full">
              <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center ${isDark ? 'text-slate-550' : 'text-slate-400'}`}>
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl py-2 pl-10 pr-4 text-xs transition-all focus:outline-none focus:border-indigo-500 ${
                isDark 
                  ? 'bg-slate-900 border-slate-850 text-slate-300 placeholder-slate-550' 
                  : 'bg-slate-50 border-slate-150 text-slate-700 placeholder-slate-400 focus:bg-white'
              }`}
            />
          </div>
        </div>

          {/* Core Controls */}
          <div className="flex flex-wrap items-center gap-3 justify-start xl:justify-end">
            
            {/* Assignee Filter drop down */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-[10px] transition-colors duration-300 ${
              isDark ? 'bg-slate-900 border-slate-850 text-slate-400' : 'bg-slate-55 bg-slate-50 border-slate-150 text-slate-600'
            }`}>
              <User className="h-3 w-3 text-indigo-500" />
              <span className="font-bold">ASSIGNEE:</span>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-extrabold text-current"
              >
                <option value="all" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>All Team</option>
                {ASSIGNEES.map(u => (
                  <option key={u.id} value={u.id} className={isDark ? 'bg-slate-900 text-slate-250' : 'bg-white text-slate-850'}>
                    👤 {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Squad Role Filter dropdown */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-[10px] transition-colors duration-300 ${
              isDark ? 'bg-slate-900 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-600'
            }`}>
              <SlidersHorizontal className="h-3 w-3 text-indigo-500" />
              <span className="font-bold">SQUAD ROLE:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-extrabold text-current"
              >
                <option value="all" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-805'}>Involved In Any</option>
                <option value="frontend" className={isDark ? 'bg-slate-900 text-slate-250' : 'bg-white text-slate-850'}>🎨 Frontend Specialist</option>
                <option value="backend" className={isDark ? 'bg-slate-900 text-slate-250' : 'bg-white text-slate-850'}>⚙️ Backend Specialist</option>
                <option value="qa" className={isDark ? 'bg-slate-900 text-slate-250' : 'bg-white text-slate-850'}>🧪 QA Tester</option>
                <option value="reviewer" className={isDark ? 'bg-slate-900 text-slate-250' : 'bg-white text-slate-850'}>💼 Review Lead</option>
              </select>
            </div>

            {/* Reviewer Filter drop down */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-[10px] transition-colors duration-300 ${
              isDark ? 'bg-slate-900 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-600'
            }`}>
              <Users className="h-3 w-3 text-indigo-500" />
              <span className="font-bold">MANAGER:</span>
              <select
                value={reviewerFilter}
                onChange={(e) => setReviewerFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-extrabold text-current"
              >
                <option value="all" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>All Leads</option>
                {ASSIGNEES.map(u => (
                  <option key={u.id} value={u.id} className={isDark ? 'bg-slate-900 text-slate-250' : 'bg-white text-slate-855'}>
                    💼 {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-[10px] transition-colors duration-300 ${
              isDark ? 'bg-slate-900 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-600'
            }`}>
              <SlidersHorizontal className="h-3 w-3 text-indigo-500" />
              <span className="font-bold">PRIORITY:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-extrabold text-current"
              >
                <option value="all" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>All Priority</option>
                <option value="high" className={isDark ? 'bg-slate-900 text-rose-400' : 'bg-white text-rose-600'}>🔴 High Priority</option>
                <option value="medium" className={isDark ? 'bg-slate-900 text-amber-400' : 'bg-white text-amber-600'}>🟡 Medium Priority</option>
                <option value="low" className={isDark ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'}>🔵 Low Priority</option>
              </select>
            </div>

            {/* Overdue filter pill */}
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer ${
                showOverdueOnly 
                  ? 'bg-rose-500/10 border-rose-500 text-rose-550 shadow-md shadow-rose-500/5' 
                  : (isDark ? 'bg-slate-900 border-slate-850 text-slate-450 hover:bg-slate-850' : 'bg-slate-50 border-slate-150 text-slate-550 hover:bg-slate-100')
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Overdue ({overdueCount})</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className={`flex items-center justify-center p-2.5 border rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800' 
                  : 'bg-slate-50 border-slate-150 text-slate-655 hover:bg-slate-100 hover:border-slate-200 shadow-sm'
              }`}
              title="Open Developer Settings & Systems Suite"
            >
              <Settings className="h-4 w-4 hover:rotate-90 transition-transform duration-500" />
            </button>

            <button
              onClick={() => {
                if (columns.length === 0) {
                  alert('Please create a column first!');
                  return;
                }
                setTargetColumnId(columns[0].id);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold transition-all shadow-md shadow-indigo-500/10 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </button>
          </div>
        </nav>

        {/* Adaptive Kanban Scrollable Board Area */}
        <div className="flex-1 p-4 md:p-8 overflow-x-auto overflow-y-hidden select-none relative scrollbar-thin snap-x snap-mandatory">
          
          <div className="flex items-start gap-4 md:gap-6 h-full min-h-[450px]">
            
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.columnId === col.id);
              const colPoints = colTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
              const { bullet: colBullet, accent: colAccent } = getColumnStyleDetails(col.title);
              
              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`flex-shrink-0 w-[290px] xs:w-80 snap-center snap-always h-[calc(100vh-160px)] ${
                    isDark 
                      ? 'bg-slate-900/30 border-slate-900' 
                      : 'bg-white border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                  } border rounded-2xl flex flex-col transition-all duration-300 relative overflow-hidden`}
                >
                  {/* Accent color strip top border (Notion-style) */}
                  <div className={`h-1.5 w-full ${colAccent}`} />
                  
                  {/* Column Header Metadata */}
                  <div className={`px-4.5 py-3.5 border-b flex items-center justify-between ${
                    isDark ? 'border-slate-900/60' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      {/* Notion style dynamic status dot */}
                      <span className={`h-2 w-2 rounded-full ${colBullet} shadow-[0_0_8px_rgba(0,0,0,0.05)]`} />
                      <h3 className={`font-black text-xs tracking-wider uppercase ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {col.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                      } text-[9px] font-bold font-mono`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Column agile summary story point tracker */}
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider border font-mono ${
                        isDark ? 'bg-slate-950 border-slate-850 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-650'
                      }`}>
                        {colPoints} SP
                      </span>
                      <button
                        onClick={() => initDeleteColumn(col.id, col.title)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isDark ? 'text-slate-550 hover:bg-slate-800 hover:text-rose-400' : 'text-slate-400 hover:bg-slate-100 hover:text-rose-600'
                        }`}
                        title="Delete Column"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks Container (Strictly Vertical Internal Scroll - NO double scrollbars) */}
                  <div className="flex-1 overflow-y-auto p-4.5 space-y-3 Scrollable-Task-Container">
                    <AnimatePresence>
                      {colTasks.map(task => {
                        const totalSubs = task.subtasks?.length || 0;
                        const doneSubs = task.subtasks?.filter(s => s.completed).length || 0;
                        const assignee = ASSIGNEES.find(u => u.id === task.assigneeId) || ASSIGNEES[0];
                        
                        const frontendDev = ASSIGNEES.find(u => u.id === task.frontendDevId) || ASSIGNEES[0];
                        const backendDev = ASSIGNEES.find(u => u.id === task.backendDevId) || ASSIGNEES[2];
                        const qaDev = ASSIGNEES.find(u => u.id === task.qaDevId) || ASSIGNEES[3];
                        const reviewerDev = ASSIGNEES.find(u => u.id === task.reviewerId) || ASSIGNEES[1];

                        const squad = [
                          { role: '🎨 Frontend Dev', user: frontendDev },
                          { role: '⚙️ Backend Dev', user: backendDev },
                          { role: '🧪 QA / Tester', user: qaDev },
                          { role: '💼 Review Lead', user: reviewerDev }
                        ];
                        
                        // Check match filters for dimming effect
                        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                              (task.ticketId || '').toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
                        const matchesAssignee = assigneeFilter === 'all' || (
                          roleFilter === 'all' ? (
                            task.assigneeId === assigneeFilter ||
                            task.frontendDevId === assigneeFilter ||
                            task.backendDevId === assigneeFilter ||
                            task.qaDevId === assigneeFilter ||
                            task.reviewerId === assigneeFilter
                          ) :
                          roleFilter === 'frontend' ? task.frontendDevId === assigneeFilter :
                          roleFilter === 'backend' ? task.backendDevId === assigneeFilter :
                          roleFilter === 'qa' ? task.qaDevId === assigneeFilter :
                          roleFilter === 'reviewer' ? task.reviewerId === assigneeFilter :
                          task.assigneeId === assigneeFilter
                        );
                        const matchesReviewer = reviewerFilter === 'all' || task.reviewerId === reviewerFilter;
                        const taskOverdue = isOverdue(task.dueDate, task.columnId);
                        const matchesOverdue = !showOverdueOnly || taskOverdue;
                        
                        const isMatched = matchesSearch && matchesPriority && matchesAssignee && matchesReviewer && matchesOverdue;
                        
                        return (
                          <motion.div
                            key={task.id}
                            layoutId={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4.5 rounded-xl border cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:-translate-y-0.5 text-left space-y-3.5 transition-all duration-350 ${
                              isDark 
                                ? 'bg-slate-900/80 border-slate-850/70 hover:border-slate-700 shadow-md' 
                                : 'bg-white border-slate-150 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-indigo-500/30 hover:shadow-[0_6px_16px_rgba(0,0,0,0.05)]'
                            } ${
                              isMatched 
                                ? 'opacity-100 scale-100 pointer-events-auto grayscale-0' 
                                : 'opacity-20 scale-[0.97] grayscale pointer-events-none select-none blur-[0.4px]'
                            }`}
                          >
                            {/* Tags & Story Point badge header */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  task.category === 'Bug' 
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                    : task.category === 'Design' 
                                      ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                                      : task.category === 'Frontend'
                                        ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                                        : task.category === 'Backend'
                                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                          : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                }`}>
                                  {task.category || 'Feature'}
                                </span>

                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black font-mono border ${
                                  isDark ? 'bg-slate-955 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-550'
                                }`}>
                                  🎫 {task.ticketId || 'APEX-100'}
                                </span>

                                {/* Dynamic Task Status Pill with visual glowing pulse */}
                                {(() => {
                                  const isDone = task.columnId === 'col-done' || columns.find(c => c.id === task.columnId)?.title.toLowerCase().includes('done');
                                  const status = isDone 
                                    ? { text: 'Completed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' }
                                    : (taskOverdue 
                                        ? { text: 'Overdue', color: 'bg-rose-500/10 text-rose-550 border-rose-500/20', dot: 'bg-rose-500 animate-pulse' }
                                        : (columns.find(c => c.id === task.columnId)?.title.toLowerCase().includes('progress') || columns.find(c => c.id === task.columnId)?.title.toLowerCase().includes('active')
                                            ? { text: 'Active', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500 animate-ping' }
                                            : { text: 'Planned', color: 'bg-indigo-500/10 text-indigo-550 border-indigo-500/20', dot: 'bg-indigo-550' }));
                                  return (
                                    <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase border flex items-center gap-1.5 transition-colors duration-300 ${status.color}`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                      {status.text}
                                    </span>
                                  );
                                })()}

                                {task.isApproved && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-0.5 shadow-sm shadow-amber-500/5 animate-pulse">
                                    ⭐ Approved
                                  </span>
                                )}
              className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold font-mono border ${
                                isDark ? 'bg-slate-950 border-slate-850 text-slate-450' : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}>
                                {task.storyPoints || 1} SP
                              </span>
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-1">
                              <h4 className={`font-bold text-xs sm:text-sm tracking-tight leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className={`text-[10px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-555'}`}>
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Primary Assignee Lead Label */}
                            <div className="flex items-center gap-1 text-[9.5px] font-bold">
                              <span className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">Lead:</span>
                              <span className={`px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-1 ${
                                isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'
                              }`}>
                                <span className={`h-3 w-3 rounded-full flex items-center justify-center text-[6px] font-black ${assignee.color}`}>
                                  {assignee.initials}
                                </span>
                                {assignee.name}
                              </span>
                            </div>

                            {/* Due Date Overdue Warnings System */}
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded-md ${
                                taskOverdue 
                                  ? 'bg-rose-500/10 text-rose-550 border border-rose-500/20 animate-pulse' 
                                  : (isDark ? 'bg-slate-950 text-slate-450 border border-slate-850' : 'bg-slate-50 text-slate-500 border border-slate-200')
                              }`}>
                                <Calendar className="h-3 w-3" />
                                <span>{taskOverdue ? '⚠️ Overdue: ' : 'Due: '}{task.dueDate}</span>
                              </div>
                            )}

                            {/* Subtask progress bar */}
                            {totalSubs > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <div className={`flex justify-between items-center text-[8px] font-black ${isDark ? 'text-slate-500' : 'text-slate-455'}`}>
                                  <span className="flex items-center gap-1">
                                    <span>SUBTASKS</span>
                                    <span className={`px-1 rounded-[4px] text-[7.5px] uppercase font-black font-mono ${
                                      totalSubs - doneSubs === 0 
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                    }`}>
                                      {totalSubs - doneSubs === 0 ? '✅ Done' : `⏳ ${totalSubs - doneSubs} Pending`}
                                    </span>
                                  </span>
                                  <span>{doneSubs}/{totalSubs} ({Math.round((doneSubs/totalSubs)*100)}%)</span>
                                </div>
                                <div className={`w-full ${isDark ? 'bg-slate-850' : 'bg-slate-100'} rounded-full h-1 overflow-hidden transition-colors`}>
                                  <div 
                                    className={`h-1 rounded-full transition-all duration-500 ${
                                      doneSubs === totalSubs 
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' 
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                    }`}
                                    style={{ width: `${(doneSubs / totalSubs) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Card Footer with Priority indicator and Sleek Overlapping Task Squad Avatars */}
                            <div className="flex items-center justify-between border-t border-slate-500/5 pt-3">
                              {/* Priority visual indicator */}
                              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                                {task.priority === 'high' && <span className="text-rose-500 font-black">🔴 High</span>}
                                {task.priority === 'medium' && <span className="text-amber-500 font-black">🟡 Med</span>}
                                {task.priority === 'low' && <span className="text-indigo-550 font-black">🔵 Low</span>}
                              </div>

                              {/* Stacked Task Squad Avatars */}
                              <div className="flex items-center gap-1">
                                <span className="text-[7.5px] font-black text-slate-400/80 uppercase tracking-widest mr-1 sm:inline hidden">Squad:</span>
                                <div className="flex items-center -space-x-1.5 overflow-hidden">
                                  {squad.map((member, idx) => (
                                    <div 
                                      key={idx} 
                                      title={`${member.role}: ${member.user.name}`}
                                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[7px] font-black shadow-[0_2px_4px_rgba(0,0,0,0.15)] border-2 ${isDark ? 'border-slate-900' : 'border-white'} transition-transform duration-200 hover:scale-125 hover:z-50 cursor-pointer ${member.user.color}`}
                                      style={{ zIndex: 40 - idx }}
                                    >
                                      {member.user.initials}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    
                    {colTasks.length === 0 && (
                      <div className={`h-24 flex flex-col items-center justify-center text-[10px] border border-dashed rounded-2xl ${
                        isDark ? 'text-slate-650 border-slate-850/40' : 'text-slate-400 border-slate-200'
                      }`}>
                        No Cards. Drop Here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Create new Column Board State Form */}
            {showAddColumnInput ? (
              <form onSubmit={handleAddColumn} className={`flex-shrink-0 w-80 ${
                isDark ? 'bg-slate-900/20 border-slate-880' : 'bg-white border-slate-200 shadow-sm'
              } border border-dashed p-4.5 rounded-2xl space-y-3 transition-all`}>
                <input
                  type="text"
                  placeholder="Column Title..."
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 transition-all ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                  }`}
                  autoFocus
                />
                <div className="flex gap-2 text-xs font-bold">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddColumnInput(false)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddColumnInput(true)}
                className={`flex-shrink-0 w-80 h-14 border border-dashed rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900/10 hover:bg-slate-900/30 border-slate-850 hover:border-slate-750 text-slate-500 hover:text-slate-300' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-550 hover:text-slate-700 shadow-sm'
                }`}
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Add Column
              </button>
            )}

          </div>
        </div>

        {/* Dynamic Confetti Explosion Particles Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <AnimatePresence>
            {confetti.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: `${p.x}vw`, y: -20, rotate: 0 }}
                animate={{ 
                  opacity: [1, 1, 0], 
                  y: '110vh', 
                  x: [`${p.x}vw`, `${p.x + (Math.random() * 20 - 10)}vw`],
                  rotate: 360 
                }}
                transition={{ 
                  duration: p.duration, 
                  delay: p.delay,
                  ease: 'easeOut'
                }}
                className="absolute rounded-sm"
                style={{
                  backgroundColor: p.color,
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}
          </AnimatePresence>
        </div>

      </main>

      {/* 3. NEW TASK CREATION wizard modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl' : 'bg-white border-slate-100 text-slate-850 shadow-[0_10px_35px_rgba(0,0,0,0.1)]'
              }`}
            >
              <button
                onClick={() => setShowAddModal(false)}
                className={`absolute top-4 right-4 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className={`font-display font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Create New Task</h3>

              <form onSubmit={handleAddTask} className="space-y-4 text-xs sm:text-sm">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Setup express REST endpoints"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
                  <textarea
                    placeholder="Write detailed specifications for the task..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 resize-none transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Task Squad Specialists Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>🎨 Frontend Specialist</label>
                    <select
                      value={newFrontendDevId}
                      onChange={(e) => {
                        setNewFrontendDevId(e.target.value);
                        setNewAssigneeId(e.target.value); // fallback
                      }}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs transition-all ${
                        isDark ? 'bg-slate-950 border-slate-805 text-slate-300' : 'bg-slate-55 border-slate-200 text-slate-700'
                      }`}
                    >
                      {ASSIGNEES.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>⚙️ Backend Specialist</label>
                    <select
                      value={newBackendDevId}
                      onChange={(e) => setNewBackendDevId(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs transition-all ${
                        isDark ? 'bg-slate-950 border-slate-805 text-slate-300' : 'bg-slate-55 border-slate-200 text-slate-700'
                      }`}
                    >
                      {ASSIGNEES.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>🧪 QA / Tester</label>
                    <select
                      value={newQaDevId}
                      onChange={(e) => setNewQaDevId(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs transition-all ${
                        isDark ? 'bg-slate-950 border-slate-805 text-slate-300' : 'bg-slate-55 border-slate-200 text-slate-700'
                      }`}
                    >
                      {ASSIGNEES.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>💼 Reviewer Lead</label>
                    <select
                      value={newReviewerId}
                      onChange={(e) => setNewReviewerId(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs transition-all ${
                        isDark ? 'bg-slate-950 border-slate-805 text-slate-300' : 'bg-slate-55 border-slate-200 text-slate-700'
                      }`}
                    >
                      {ASSIGNEES.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date Row */}
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>

                {/* Tags Category & Story Points */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category Tag</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="Feature">🚀 Feature</option>
                      <option value="Bug">🐛 Bug Fix</option>
                      <option value="Frontend">🎨 Frontend UI</option>
                      <option value="Backend">⚙️ Backend Api</option>
                      <option value="Design">📐 Schema Design</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Agile Story Points</label>
                    <select
                      value={newStoryPoints}
                      onChange={(e) => setNewStoryPoints(Number(e.target.value))}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="1">1 Story Point</option>
                      <option value="2">2 Story Points</option>
                      <option value="3">3 Story Points</option>
                      <option value="5">5 Story Points (Medium)</option>
                      <option value="8">8 Story Points (Large)</option>
                    </select>
                  </div>
                </div>

                {/* Column & Priority selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Target Column</label>
                    <select
                      value={targetColumnId}
                      onChange={(e) => setTargetColumnId(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {columns.map(c => (
                        <option key={c.id} value={c.id} className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-850'}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority Level</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all font-bold ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="low">🔵 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 text-xs cursor-pointer"
                >
                  Create Task Card
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. TASK SPECIFICATIONS EDITOR MODAL */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-left transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl' : 'bg-white border-slate-100 text-slate-850 shadow-[0_10px_40px_rgba(0,0,0,0.12)]'
              }`}
            >
              <button
                onClick={() => setSelectedTask(null)}
                className={`absolute top-4 right-4 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Priority & Categories Editor Header */}
              <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  SPECIFICATION TICKET: <strong className="text-indigo-500 font-black font-mono">{selectedTask.ticketId || 'APEX-100'}</strong>
                </span>
                
                <div className="flex flex-wrap gap-2">
                  {/* Frontend Dev selector */}
                  <select
                    value={selectedTask.frontendDevId || 'usr-1'}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { 
                      frontendDevId: e.target.value,
                      assigneeId: e.target.value 
                    })}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border cursor-pointer ${
                      isDark ? 'bg-slate-950 text-slate-250 border-slate-800' : 'bg-slate-50 text-slate-750 border-slate-200'
                    }`}
                    title="Frontend Specialist Dev"
                  >
                    {ASSIGNEES.map(u => (
                      <option key={u.id} value={u.id}>🎨 {u.initials}</option>
                    ))}
                  </select>

                  {/* Backend Dev selector */}
                  <select
                    value={selectedTask.backendDevId || 'usr-3'}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { backendDevId: e.target.value })}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border cursor-pointer ${
                      isDark ? 'bg-slate-950 text-slate-250 border-slate-800' : 'bg-slate-50 text-slate-750 border-slate-200'
                    }`}
                    title="Backend Specialist Dev"
                  >
                    {ASSIGNEES.map(u => (
                      <option key={u.id} value={u.id}>⚙️ {u.initials}</option>
                    ))}
                  </select>

                  {/* QA Dev selector */}
                  <select
                    value={selectedTask.qaDevId || 'usr-4'}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { qaDevId: e.target.value })}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border cursor-pointer ${
                      isDark ? 'bg-slate-950 text-slate-250 border-slate-800' : 'bg-slate-50 text-slate-750 border-slate-200'
                    }`}
                    title="QA Tester specialist"
                  >
                    {ASSIGNEES.map(u => (
                      <option key={u.id} value={u.id}>🧪 {u.initials}</option>
                    ))}
                  </select>

                  {/* Reviewer Lead selector */}
                  <select
                    value={selectedTask.reviewerId || 'usr-2'}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { reviewerId: e.target.value })}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border cursor-pointer ${
                      isDark ? 'bg-slate-950 text-slate-250 border-slate-800' : 'bg-slate-50 text-slate-750 border-slate-200'
                    }`}
                    title="Reviewing Manager Lead"
                  >
                    {ASSIGNEES.map(u => (
                      <option key={u.id} value={u.id}>💼 {u.initials}</option>
                    ))}
                  </select>

                  {/* Category editor */}
                  <select
                    value={selectedTask.category || 'Feature'}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { category: e.target.value })}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border cursor-pointer ${
                      isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="Feature">🚀 Feature</option>
                    <option value="Bug">🐛 Bug Fix</option>
                    <option value="Frontend">🎨 Frontend UI</option>
                    <option value="Backend">⚙️ Backend Api</option>
                    <option value="Design">📐 Schema Design</option>
                  </select>

                  {/* Story Points editor */}
                  <select
                    value={selectedTask.storyPoints || 1}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { storyPoints: Number(e.target.value) })}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border cursor-pointer font-mono ${
                      isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-750 border-slate-200'
                    }`}
                  >
                    <option value="1">1 SP</option>
                    <option value="2">2 SP</option>
                    <option value="3">3 SP</option>
                    <option value="5">5 SP</option>
                    <option value="8">8 SP</option>
                  </select>

                  {/* Priority editor */}
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { priority: e.target.value })}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer ${
                      isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-750 border-slate-200'
                    } ${
                      selectedTask.priority === 'high' ? 'text-rose-500 border-rose-500/20' :
                      selectedTask.priority === 'medium' ? 'text-amber-500 border-amber-500/20' :
                      'text-indigo-500 border-indigo-500/20'
                    }`}
                  >
                    <option value="low">🔵 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 text-left">
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { title: e.target.value })}
                  className={`w-full bg-transparent font-display font-black text-lg sm:text-xl border-b border-transparent focus:outline-none py-1 transition-all ${
                    isDark ? 'text-slate-100 focus:border-slate-800' : 'text-slate-850 focus:border-slate-200'
                  }`}
                />
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { description: e.target.value })}
                  placeholder="Describe specs and developer requirements..."
                  rows={2}
                  className={`w-full border rounded-xl p-3 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed transition-all ${
                    isDark ? 'bg-slate-950 border-slate-800/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                  }`}
                />
              </div>

              {/* Due Date Calendar specification inline */}
              <div className="space-y-1.5 text-left">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due Date deadline</label>
                <div className="relative max-w-[200px]">
                  <input
                    type="date"
                    value={selectedTask.dueDate || ''}
                    onChange={(e) => handleUpdateTaskDetail(selectedTask.id, { dueDate: e.target.value })}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-750'
                    }`}
                  />
                </div>
              </div>

              {/* Manager Verification & Approved Sign-off */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                selectedTask.isApproved 
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-inner' 
                  : (isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-200')
              }`}>
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                    🌟 Manager Review Status
                  </span>
                  <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedTask.isApproved 
                      ? `Approved & Verified by Lead: ${ASSIGNEES.find(u => u.id === selectedTask.reviewerId)?.name}` 
                      : `Awaiting sign-off by Lead: ${ASSIGNEES.find(u => u.id === selectedTask.reviewerId)?.name}`}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTaskDetail(selectedTask.id, { isApproved: !selectedTask.isApproved });
                    addLog(selectedTask.isApproved ? `❌ Unapproved: "${selectedTask.title}"` : `🌟 Manager Approved: "${selectedTask.title}"`);
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedTask.isApproved 
                      ? 'bg-amber-550 text-white hover:bg-amber-600 shadow-md shadow-amber-500/15' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/15'
                  }`}
                >
                  {selectedTask.isApproved ? 'Approved ⭐' : 'Sign Off'}
                </button>
              </div>

              {/* Subtasks Section */}
              <div className="space-y-3">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subtasks Checklist</h4>
                
                {/* Add Subtask Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputVal = e.target.elements.subtaskText.value;
                    handleAddSubtask(selectedTask, inputVal);
                    e.target.reset();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="subtaskText"
                    placeholder="Add a subtask requirements..."
                    className={`flex-1 border rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500/50 transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-750 focus:bg-white'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-650 shadow-sm'
                    }`}
                  >
                    Add
                  </button>
                </form>

                {/* Subtask Items */}
                <div className="max-h-[100px] overflow-y-auto space-y-2 pr-1">
                  {selectedTask.subtasks && selectedTask.subtasks.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => toggleSubtask(selectedTask, s.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        isDark 
                          ? 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 hover:border-slate-800' 
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-150 hover:border-slate-200'
                      }`}
                    >
                      <span className={`h-4.5 w-4.5 rounded flex items-center justify-center border transition-all ${
                        s.completed ? 'bg-indigo-600 border-indigo-600 text-white' : (isDark ? 'border-slate-800' : 'border-slate-300')
                      }`}>
                        {s.completed && <Check className="h-3 w-3" />}
                      </span>
                      <span className={`flex-1 transition-all ${
                        s.completed 
                          ? 'text-slate-400 line-through' 
                          : (isDark ? 'text-slate-300' : 'text-slate-750')
                      }`}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                  {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
                    <p className={`text-[10px] text-center py-2 ${isDark ? 'text-slate-550' : 'text-slate-400'}`}>No subtasks checklist created.</p>
                  )}
                </div>
              </div>

              {/* Delete task trigger */}
              <div className={`border-t pt-4 flex justify-between items-center text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-450'}`}>ID: {selectedTask.id}</span>
                <button
                  onClick={() => initDeleteTask(selectedTask.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-500/20 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 hover:text-white font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CUSTOM PREMIUM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`border rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative text-center transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-850 text-slate-100' : 'bg-white border-slate-150 text-slate-850 shadow-[0_10px_35px_rgba(0,0,0,0.1)]'
              }`}
            >
              {/* Glowing Red Warning Header */}
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-555">
                <AlertCircle className="h-5.5 w-5.5" />
              </div>

              {/* Title & Warning Message */}
              <div className="space-y-2">
                <h3 className={`font-display font-black text-sm tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-850'}`}>
                  {deleteConfirmation.type === 'column' ? 'Delete Board Column?' : 'Delete Task Card?'}
                </h3>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Are you sure you want to permanently delete <strong className="text-rose-500 font-bold">"{deleteConfirmation.title}"</strong>? 
                  {deleteConfirmation.type === 'column' && " This action will cascade delete all tasks inside this column."} This process cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 text-xs font-bold pt-1">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className={`flex-1 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-750 border-slate-750 text-slate-350' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-650'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmation.type === 'task') {
                      executeDeleteTask(deleteConfirmation.id);
                    } else {
                      executeDeleteColumn(deleteConfirmation.id, deleteConfirmation.title);
                    }
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-750 text-white rounded-xl transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. INTERACTIVE ANALYTICS & VELOCITY INSIGHTS MODAL */}
      <AnimatePresence>
        {showAnalytics && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-left transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-150 text-slate-850'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-500/10">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5.5 w-5.5 text-indigo-500" />
                  <h3 className={`font-display font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    Workspace Velocity & Insights
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Ring Summary bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black tracking-wider text-slate-450 uppercase">
                  <span>AGILE POINTS COMPLETED</span>
                  <span>{completedStoryPoints} / {totalStoryPoints} Story Points ({totalStoryPoints > 0 ? Math.round((completedStoryPoints/totalStoryPoints)*100) : 0}%)</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-950 border border-slate-850' : 'bg-slate-100 border border-slate-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Workload Capacity Bar Chart per Developer */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                  DEVELOPER WORKLOAD CAPACITY
                </h4>

                <div className="space-y-3">
                  {ASSIGNEES.map(dev => {
                    const devTasks = tasks.filter(t => 
                      t.frontendDevId === dev.id || 
                      t.backendDevId === dev.id || 
                      t.qaDevId === dev.id
                    );
                    const devActiveTasks = devTasks.filter(t => {
                      const isDone = t.columnId === 'col-done' || columns.find(c => c.id === t.columnId)?.title.toLowerCase().includes('done');
                      return !isDone;
                    });
                    const devPoints = devActiveTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
                    
                    // High workload threshold > 6 active story points
                    const isOverloaded = devPoints >= 6;
                    const percentage = Math.min((devPoints / 12) * 100, 100);

                    return (
                      <div key={dev.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black ${dev.color}`}>
                              {dev.initials}
                            </span>
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{dev.name}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            {isOverloaded && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 tracking-wider">
                                ⚠️ High Workload
                              </span>
                            )}
                            <span className="font-mono text-slate-450">{devPoints} SP Active</span>
                          </div>
                        </div>

                        {/* Visual Capacity indicator */}
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverloaded 
                                ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category tag distribution */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-450">
                  CATEGORY TAG BREAKDOWN
                </h4>
                
                <div className="grid grid-cols-2 gap-3.5 text-[10px] font-bold">
                  {['Feature', 'Bug', 'Frontend', 'Backend', 'Design'].map(cat => {
                    const count = tasks.filter(t => t.category === cat).length;
                    const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                    
                    return (
                      <div key={cat} className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${
                            cat === 'Bug' ? 'bg-rose-500' :
                            cat === 'Design' ? 'bg-purple-500' :
                            cat === 'Frontend' ? 'bg-cyan-500' :
                            cat === 'Backend' ? 'bg-amber-500' : 'bg-indigo-550'
                          }`} />
                          <span className={isDark ? 'text-slate-400' : 'text-slate-655'}>{cat}</span>
                        </div>
                        <span className="font-mono text-indigo-550">{count} cards ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center">
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer"
                >
                  Close Insights
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. FLOATING SAAS HELPDESK FAB & PORTAL MODAL */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <button
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-2 px-4.5 py-3 bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-black text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10 uppercase tracking-wider group"
        >
          <LifeBuoy className="h-4 w-4 animate-spin-slow group-hover:scale-110 transition-transform" />
          <span>Support Desk</span>
        </button>
      </div>

      <AnimatePresence>
        {/* 6b. FULL-STACK DEVELOPER SETTINGS MODAL */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-left transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl' : 'bg-white border-slate-100 text-slate-850 shadow-[0_10px_35px_rgba(0,0,0,0.1)]'
              }`}
            >
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`absolute top-4 right-4 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 border-b pb-3 border-slate-500/10">
                <Settings className="h-5 w-5 text-indigo-500" />
                <h3 className={`font-display font-black text-sm tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-850'}`}>
                  Developer Settings & Systems
                </h3>
              </div>

              {/* Real-time audit logs console */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <h4 className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>System Audit Logs</h4>
                </div>
                <div className={`h-36 overflow-y-auto rounded-xl p-3 border font-mono text-[9px] space-y-2 leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-650'
                }`}>
                  {logs.map(log => (
                    <div key={log.id} className="border-b border-slate-500/5 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-indigo-500 mr-1.5 font-bold">[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center text-slate-400 py-10 font-sans text-[10px]">
                      No system audits recorded yet. Edit cards to populate!
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace Dynamic Team Manager */}
              <div className="space-y-2.5 border-t pt-4 border-slate-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    <h4 className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Workspace Team Manager</h4>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-500/5 px-1.5 py-0.5 rounded-md">{assignees.length} Members</span>
                </div>

                {/* Team members list */}
                <div className={`max-h-32 overflow-y-auto rounded-xl p-2.5 border space-y-1.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-850/70' : 'bg-slate-50/70 border-slate-150'
                }`}>
                  {assignees.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-500/5 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-black ${u.color}`}>
                          {u.initials}
                        </div>
                        <span className={isDark ? 'text-slate-350' : 'text-slate-700'}>{u.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(u.id)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          isDark ? 'text-slate-500 hover:text-rose-450 hover:bg-slate-900' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-105'
                        }`}
                        title="Remove member"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add member form */}
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter full name..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className={`flex-1 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 transition-all ${
                      isDark ? 'bg-slate-955 border-slate-805 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-700 focus:bg-white'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-500/10 cursor-pointer uppercase tracking-wider"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Export & Import workspace section */}
              <div className="space-y-2 border-t pt-4 border-slate-500/10">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                  <h4 className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Database Workspace Backups</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportWorkspace}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-[10px] transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                      isDark 
                        ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                    }`}
                    title="Backup entire Board to JSON file"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-500" />
                    Backup (JSON)
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-[10px] transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                      isDark 
                        ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                    }`}
                    title="Restore board from JSON backup file"
                  >
                    <Upload className="h-3.5 w-3.5 text-emerald-500" />
                    Restore (JSON)
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportWorkspace} 
                    accept=".json" 
                    className="hidden" 
                  />
                </div>

                <button
                  onClick={handleExportExcel}
                  className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-[10px] transition-all cursor-pointer hover:scale-[1.01] active:scale-95 ${
                    isDark 
                      ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200 shadow-md' 
                      : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-250 text-emerald-700 shadow-sm'
                  }`}
                  title="Export spreadsheet report"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  Export Excel Spreadsheet (CSV)
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {showSupportModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left transition-all duration-300 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl' : 'bg-white border-slate-100 text-slate-850 shadow-[0_10px_35px_rgba(0,0,0,0.1)]'
              }`}
            >
              <button
                onClick={() => setShowSupportModal(false)}
                className={`absolute top-4 right-4 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 border-b pb-3 border-slate-500/10">
                <LifeBuoy className="h-5 w-5 text-indigo-500" />
                <h3 className={`font-display font-black text-sm tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-850'}`}>
                  Lodge Support Ticket
                </h3>
              </div>

              <form onSubmit={handleCreateSupportTicket} className="space-y-3.5 text-xs sm:text-sm">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Issue Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Payment gateway loading slows down"
                    value={supportTitle}
                    onChange={(e) => setSupportTitle(e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detailed Description</label>
                  <textarea
                    placeholder="Explain the anomaly or user issue in details..."
                    value={supportDesc}
                    onChange={(e) => setSupportDesc(e.target.value)}
                    rows={2}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 resize-none transition-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Category & Priority Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
                    <select
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs transition-all ${
                        isDark ? 'bg-slate-950 border-slate-805 text-slate-300' : 'bg-slate-55 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="Bug">🐛 Bug Fix</option>
                      <option value="Feature">🚀 Feature Request</option>
                      <option value="Design">📞 Client Support</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Severity</label>
                    <select
                      value={supportPriority}
                      onChange={(e) => setSupportPriority(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs transition-all ${
                        isDark ? 'bg-slate-950 border-slate-805 text-slate-300' : 'bg-slate-55 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="low">🔵 Low Severity</option>
                      <option value="medium">🟡 Medium Severity</option>
                      <option value="high">🔴 High / Hotfix</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-750 hover:to-purple-750 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 text-xs cursor-pointer border border-white/5"
                >
                  File Support Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. LIVE PREMIUM TOAST NOTIFICATIONS SLIDE-IN ENGINE */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2.5 max-w-xs w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`p-3.5 rounded-xl border shadow-xl flex items-center gap-2.5 pointer-events-auto backdrop-blur-md transition-colors ${
                isDark 
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
                  : 'bg-white/90 border-slate-200 text-slate-800 shadow-[0_6px_20px_rgba(0,0,0,0.06)]'
              }`}
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-duration-1000"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <p className="text-[10px] font-extrabold tracking-wide uppercase leading-normal">
                {t.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
