import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks-v2')) || []);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Work'); // New Feature: Category state
  const [filter, setFilter] = useState('All');       // New Feature: Active filter state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak')) || 0);

  // Pomodoro States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks-v2', JSON.stringify(tasks));
    localStorage.setItem('streak', streak);
    localStorage.setItem('theme', theme);
  }, [tasks, streak, theme]);

  // Pomodoro Countdown Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsTimerRunning(false);
      alert("🚨 Focus session finished! Take a well-deserved break.");
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const addTask = () => {
    if (!text.trim()) return;
    setTasks([...tasks, {
      id: Date.now(),
      text,
      completed: false,
      priority: priority,
      category: category, // Saving category choice
      createdAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }]);
    setText('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id && !t.completed) setStreak(s => s + 1);
      return t.id === id ? { ...t, completed: !t.completed } : t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // New Feature: Clear Completed Utilities
  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true; // 'All'
  });

  const fiveTasksCreated = tasks.length >= 5;
  const tenTasksCompleted = tasks.filter(t => t.completed).length >= 10;

  return (
    <div className={`dashboard-wrapper ${theme}`}>
      <div className="container">
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>🚀 Ultimate Dashboard</h1>
          <button className="btn-secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>

        {/* Dynamic Analytics Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Productivity Streak</h4>
            <p>🔥 {streak} days</p>
          </div>
          <div className="stat-card">
            <h4>Pending Work</h4>
            <p>📋 {tasks.filter(t => !t.completed).length}</p>
          </div>
          <div className="stat-card">
            <h4>Completed Tasks</h4>
            <p>✅ {tasks.filter(t => t.completed).length}</p>
          </div>
        </div>

        {/* Input Controls Row */}
        <div className="row">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{maxWidth: '120px'}}>
            <option value="Work">💼 Work</option>
            <option value="Personal">🏠 Personal</option>
            <option value="Health">💪 Health</option>
            <option value="Shopping">🛒 Shop</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{maxWidth: '120px'}}>
            <option value="Low">Low 🟢</option>
            <option value="Medium">Medium 🟡</option>
            <option value="High">High 🔴</option>
          </select>
          <button onClick={addTask}>Add Task</button>
        </div>

        {/* Focus Feature: Pomodoro Section */}
        <div className="pomodoro-container">
          <div>
            <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.9, letterSpacing: '0.05em' }}>Focus Session</h4>
            <div className="timer-digits">{formatTime(timeLeft)}</div>
          </div>
          <div className="timer-controls">
            <button className="timer-btn" onClick={() => setIsTimerRunning(!isTimerRunning)}>
              {isTimerRunning ? '⏸️ Pause' : '▶️ Focus'}
            </button>
            <button className="timer-btn" onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }}>
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Interactive Filtering Bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            {['All', 'Active', 'Completed'].map((type) => (
              <button 
                key={type} 
                className={`filter-btn ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          {tasks.some(t => t.completed) && (
            <button className="btn-danger" style={{fontSize: '0.85rem', padding: '6px 12px'}} onClick={clearCompleted}>
              🧹 Clear Completed
            </button>
          )}
        </div>

        {/* Tasks Node Container */}
        <h3>Active Assignments ({filteredTasks.length})</h3>
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              No tasks match this view. Create something new or alter filters!
            </p>
          ) : (
            filteredTasks.map(task => (
              <div className="task" key={task.id}>
                <div className="task-left">
                  <input 
                    type="checkbox" 
                    style={{ transform: 'scale(1.25)', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className={task.completed ? 'done' : ''} style={{ fontWeight: '500' }}>
                    {task.text}
                  </span>
                </div>
                <div className="task-right">
                  <span className="badge category-badge">{task.category || 'Work'}</span>
                  <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{task.createdAt}</small>
                  <button className="btn-danger" onClick={() => deleteTask(task.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Achievements Section */}
        <h3>Unlocked Achievements</h3>
        <ul className="achievements-list">
          <li className={`achievement-item ${fiveTasksCreated ? 'unlocked' : ''}`}>
            <span style={{fontSize: '1.5rem'}}>{fiveTasksCreated ? '🏅' : '🔒'}</span>
            <div>
              <strong>{fiveTasksCreated ? 'Master Creator' : 'Create 5 Tasks'}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Progress milestone tracking</p>
            </div>
          </li>
          <li className={`achievement-item ${tenTasksCompleted ? 'unlocked' : ''}`}>
            <span style={{fontSize: '1.5rem'}}>{tenTasksCompleted ? '🏆' : '🔒'}</span>
            <div>
              <strong>{tenTasksCompleted ? 'Ultimate Finisher' : 'Complete 10 Tasks'}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Consistency execution award</p>
            </div>
          </li>
        </ul>

      </div>
    </div>
  );
}