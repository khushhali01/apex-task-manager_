import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// ==========================================
// 🔌 MongoDB Atlas Connection Setup (Hybrid)
// ==========================================
let isMongoConnected = false;

const connectDb = async () => {
  if (process.env.MONGODB_URI) {
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(process.env.MONGODB_URI);
      isMongoConnected = true;
      console.log('🔌 Connected successfully to MongoDB Atlas Cloud Database!');
    } catch (error) {
      console.error('❌ MongoDB Connection failed. Falling back to local db.json:', error.message);
    }
  } else {
    console.log('ℹ️ MONGODB_URI not found in environment. Running with local db.json fallback.');
  }
};
connectDb();

// ==========================================
// 📦 Mongoose Schemas & Models
// ==========================================
const ColumnSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true }
}, { timestamps: true });
const ColumnModel = mongoose.models.Column || mongoose.model('Column', ColumnSchema);

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  columnId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, default: 'medium' },
  subtasks: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  storyPoints: { type: Number, default: 1 },
  category: { type: String, default: 'Feature' },
  assigneeId: { type: String, default: 'usr-1' },
  frontendDevId: { type: String, default: 'usr-1' },
  backendDevId: { type: String, default: 'usr-3' },
  qaDevId: { type: String, default: 'usr-4' },
  reviewerId: { type: String, default: 'usr-2' },
  isApproved: { type: Boolean, default: false },
  dueDate: { type: String, default: '' },
  ticketId: { type: String, default: '' }
}, { timestamps: true });
const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// ==========================================
// 📁 JSON File Database Helpers (Fallback)
// ==========================================
const readDb = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Seed default initial data if file doesn't exist
      const defaultData = {
        columns: [
          { id: "col-todo", title: "To Do" },
          { id: "col-progress", title: "In Progress" },
          { id: "col-done", title: "Done" }
        ],
        tasks: [
          {
            id: "task-1",
            columnId: "col-todo",
            title: "🚀 Welcome to ApexTask Pro!",
            description: "Try dragging this card to 'In Progress' to trigger a celebration confetti!",
            priority: "high",
            subtasks: [
              { id: "sub-1", title: "Explore analytics dashboard", completed: false },
              { id: "sub-2", title: "Test backup export & restore", completed: false }
            ],
            storyPoints: 3,
            category: "Feature",
            assigneeId: "usr-1",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
          }
        ]
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { columns: [], tasks: [] };
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
};

// ==========================================
// ⚙️ API ENDPOINTS
// ==========================================

// 1. Get Board Data (columns & tasks)
app.get('/api/board', async (req, res) => {
  if (isMongoConnected) {
    try {
      const columns = await ColumnModel.find({}, { _id: 0, __v: 0 }).sort({ createdAt: 1 });
      const tasks = await TaskModel.find({}, { _id: 0, __v: 0 }).sort({ createdAt: 1 });
      return res.json({ columns, tasks });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch cloud board: ' + err.message });
    }
  }
  
  // Fallback to local file
  const db = readDb();
  res.json(db);
});

// 2. Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, columnId, subtasks, storyPoints, category, assigneeId, frontendDevId, backendDevId, qaDevId, reviewerId, isApproved, dueDate } = req.body;
  
  if (!title || !columnId) {
    return res.status(400).json({ error: 'Title and columnId are required' });
  }

  let ticketId = req.body.ticketId || '';
  if (!ticketId) {
    try {
      if (isMongoConnected) {
        const count = await TaskModel.countDocuments();
        ticketId = `APEX-${101 + count}`;
      } else {
        const dbData = readDb();
        const count = (dbData.tasks || []).length;
        ticketId = `APEX-${101 + count}`;
      }
    } catch (err) {
      ticketId = `APEX-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  const taskPayload = {
    id: `task-${Date.now()}`,
    ticketId,
    columnId,
    title,
    description: description || '',
    priority: priority || 'medium',
    subtasks: subtasks || [],
    storyPoints: Number(storyPoints) || 1,
    category: category || 'Feature',
    assigneeId: assigneeId || frontendDevId || 'usr-1',
    frontendDevId: frontendDevId || assigneeId || 'usr-1',
    backendDevId: backendDevId || 'usr-3',
    qaDevId: qaDevId || 'usr-4',
    reviewerId: reviewerId || 'usr-2',
    isApproved: isApproved || false,
    dueDate: dueDate || ''
  };

  if (isMongoConnected) {
    try {
      const newTask = new TaskModel(taskPayload);
      await newTask.save();
      return res.status(201).json(newTask);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save task to cloud: ' + err.message });
    }
  }

  // Fallback to local file
  const db = readDb();
  db.tasks.push(taskPayload);
  writeDb(db);
  res.status(201).json(taskPayload);
});

// 2b. Import/Restore Full Board Backup
app.post('/api/import', async (req, res) => {
  const { columns, tasks } = req.body;
  if (!Array.isArray(columns) || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Invalid board data structure' });
  }

  if (isMongoConnected) {
    try {
      // In cloud mode, drop current data and bulk insert
      await ColumnModel.deleteMany({});
      await TaskModel.deleteMany({});
      
      if (columns.length > 0) await ColumnModel.insertMany(columns);
      if (tasks.length > 0) await TaskModel.insertMany(tasks);
      
      return res.json({ columns, tasks });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to import backup to cloud: ' + err.message });
    }
  }

  // Fallback to local file
  const db = { columns, tasks };
  writeDb(db);
  res.json(db);
});

// 3. Update a task (column, title, priority, subtasks, etc.)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (isMongoConnected) {
    try {
      const updatedTask = await TaskModel.findOneAndUpdate({ id }, updates, { new: true, projection: { _id: 0, __v: 0 } });
      if (!updatedTask) return res.status(404).json({ error: 'Task not found in cloud' });
      return res.json(updatedTask);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update cloud task: ' + err.message });
    }
  }

  // Fallback to local file
  const db = readDb();
  const taskIndex = db.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found locally' });
  }

  db.tasks[taskIndex] = {
    ...db.tasks[taskIndex],
    ...updates
  };

  writeDb(db);
  res.json(db.tasks[taskIndex]);
});

// 4. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      const deleted = await TaskModel.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Task not found in cloud' });
      return res.json({ message: 'Task deleted successfully from cloud', id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete cloud task: ' + err.message });
    }
  }

  // Fallback to local file
  const db = readDb();
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== id);

  if (db.tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found locally' });
  }

  writeDb(db);
  res.json({ message: 'Task deleted successfully locally', id });
});

// 5. Create a new column
app.post('/api/columns', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Column title is required' });
  }

  const columnPayload = {
    id: `col-${Date.now()}`,
    title
  };

  if (isMongoConnected) {
    try {
      const newColumn = new ColumnModel(columnPayload);
      await newColumn.save();
      return res.status(201).json(newColumn);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save column to cloud: ' + err.message });
    }
  }

  // Fallback to local file
  const db = readDb();
  db.columns.push(columnPayload);
  writeDb(db);
  res.status(201).json(columnPayload);
});

// 6. Delete a column (and cascade delete its tasks)
app.delete('/api/columns/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      const deletedCol = await ColumnModel.findOneAndDelete({ id });
      if (!deletedCol) return res.status(404).json({ error: 'Column not found in cloud' });
      
      // Cascade delete tasks in this column
      await TaskModel.deleteMany({ columnId: id });
      return res.json({ message: 'Column and its tasks deleted successfully from cloud', id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete cloud column: ' + err.message });
    }
  }

  // Fallback to local file
  const db = readDb();
  const columnExists = db.columns.some(c => c.id === id);
  if (!columnExists) {
    return res.status(404).json({ error: 'Column not found locally' });
  }

  db.columns = db.columns.filter(c => c.id !== id);
  db.tasks = db.tasks.filter(t => t.columnId !== id); // Cascade delete

  writeDb(db);
  res.json({ message: 'Column and its tasks deleted successfully locally', id });
});

// ==========================================
// 🚀 Unified Production Hosting Integration
// ==========================================
const distPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(distPath)) {
  console.log(`📡 Production mode enabled: Serving client static assets from ${distPath}`);
  app.use(express.static(distPath));
  
  // SPA Catch-all client-side routing
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('📡 Development mode enabled: Serve static files separately via client Vite server.');
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 ApexTask Backend running at http://localhost:${PORT}`);
  });
}

export default app;
