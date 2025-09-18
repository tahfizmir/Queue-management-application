
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


const User = require('./models/User');
const Queue = require('./models/Queue');
const Token = require('./models/Token');



const authMiddleware = require('./middleware/auth');



app.get('/', (req, res) => res.json({ ok: true, service: 'queue-backend' }));


app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const u = await User.create({ email, password: hashed });

    const token = jwt.sign({ id: u._id, email: u.email }, process.env.JWT_SECRET);

    res.json({ token, user: { id: u._id, email: u.email } });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) return res.status(400).json({ error: 'email already in use' });
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/queues', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const q = await Queue.create({ name, manager: req.user.id });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/queues', authMiddleware, async (req, res) => {
  try {
    const queues = await Queue.find({ manager: req.user.id }).lean();
    res.json(queues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adding token to queue (creates token with next position)
app.post('/api/queues/:id/tokens', authMiddleware, async (req, res) => {
  try {
    const queueId = req.params.id;
    const queue = await Queue.findById(queueId);
    if (!queue) return res.status(404).json({ error: 'Queue not found' });
    // count existing waiting tokens to set next position
    const count = await Token.countDocuments({ queue: queueId, status: 'waiting' });
    const token = await Token.create({
      queue: queueId,
      name: req.body.name || null,
      position: count + 1,
    });
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tokens for queue (waiting)
app.get('/api/queues/:id/tokens', authMiddleware, async (req, res) => {
  try {
    const tokens = await Token.find({ queue: req.params.id, status: 'waiting' }).sort('position');
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move token up or down by swapping positions with neighbor
// body: { direction: 'up'|'down' }
app.post('/api/tokens/:id/move', authMiddleware, async (req, res) => {
  try {
    const { direction } = req.body;
    if (!['up', 'down'].includes(direction)) return res.status(400).json({ error: 'direction must be up or down' });

    const t = await Token.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Token not found' });
    if (t.status !== 'waiting') return res.status(400).json({ error: 'only waiting tokens can be moved' });

    const currentPos = t.position;
    const targetPos = direction === 'up' ? currentPos - 1 : currentPos + 1;
    if (targetPos < 1) return res.status(400).json({ error: 'already at top' });

    const neighbor = await Token.findOne({ queue: t.queue, position: targetPos, status: 'waiting' });
    if (!neighbor) return res.status(400).json({ error: 'no token to swap with' });

    // swap positions
    t.position = targetPos;
    neighbor.position = currentPos;
    await t.save();
    await neighbor.save();

    res.json({ moved: t, swappedWith: neighbor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign top token for service (id is token id OR provide queueId to auto-assign top)
app.post('/api/queues/:id/assignTop', authMiddleware, async (req, res) => {
  try {
    const queueId = req.params.id;
    const top = await Token.findOne({ queue: queueId, status: 'waiting' }).sort('position');
    if (!top) return res.status(404).json({ error: 'no waiting tokens' });
    top.status = 'assigned';
    top.assignedAt = new Date();
    await top.save();
    // optionally shift up positions of remaining waiting tokens (decrement those with position > top.position)
    await Token.updateMany(
      { queue: queueId, status: 'waiting', position: { $gt: top.position } },
      { $inc: { position: -1 } }
    );
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tokens/:id/assign', authMiddleware, async (req, res) => {
  try {
    const t = await Token.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Token not found' });
    if (t.status !== 'waiting') return res.status(400).json({ error: 'token not in waiting state' });
    t.status = 'assigned';
    t.assignedAt = new Date();
    const pos = t.position;
    await t.save();
    await Token.updateMany({ queue: t.queue, status: 'waiting', position: { $gt: pos } }, { $inc: { position: -1 } });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tokens/:id', authMiddleware, async (req, res) => {
  try {
    const t = await Token.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Token not found' });
    if (t.status !== 'waiting') {
      t.status = 'cancelled';
      t.cancelledAt = new Date();
      await t.save();
      return res.json(t);
    }
    const pos = t.position;
    t.status = 'cancelled';
    t.cancelledAt = new Date();
    await t.save();
    await Token.updateMany({ queue: t.queue, status: 'waiting', position: { $gt: pos } }, { $inc: { position: -1 } });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/queues/:id/analytics', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const queueId = req.params.id;
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

   
    const servedTokens = await Token.find({
      queue: queueId,
      assignedAt: { $gte: start, $lte: end },
      createdAt: { $exists: true },
    }).lean();

    const avgWaitMs =
      servedTokens.length === 0
        ? null
        : Math.round(servedTokens.reduce((acc, t) => acc + (new Date(t.assignedAt) - new Date(t.createdAt)), 0) / servedTokens.length);

    const totalServed = await Token.countDocuments({ queue: queueId, status: 'assigned', assignedAt: { $gte: start, $lte: end } });

    const currentQueueLength = await Token.countDocuments({ queue: queueId, status: 'waiting' });

    const trend = [];
    for (let i = 0; i <= days; i++) {
      const dayStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
      const count = await Token.countDocuments({ queue: queueId, createdAt: { $gte: dayStart, $lte: dayEnd } });
      trend.push({ date: dayStart.toISOString().slice(0, 10), count });
    }

    res.json({ avgWaitMs, totalServed, currentQueueLength, trend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


if (require.main === module) {
  

  const PORT = process.env.PORT || 7000;
  mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

module.exports = app;
