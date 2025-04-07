const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { db, auth } = require('../../firebase-admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Endpoints

// Generate AI Response
app.post('/generate', authenticate, async (req, res) => {
  const { message, context, model, files } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post('https://nimbusagi.netlify.app/api/nimbus', {
      message,
      context: context || '',
      model: model || 'aviyon1.2',
      files: files || [],
    });
    res.json({ response: response.data.response });
  } catch (error) {
    res.status(500).json({ error: `Failed to generate response: ${error.message}` });
  }
});

// Fetch Threads
app.get('/threads', authenticate, async (req, res) => {
  try {
    const threadsRef = db.collection('users').doc(req.user.uid).collection('threads');
    const snapshot = await threadsRef.get();
    const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch threads: ${error.message}` });
  }
});

// Create Thread
app.post('/threads', authenticate, async (req, res) => {
  try {
    const threadsRef = db.collection('users').doc(req.user.uid).collection('threads');
    const newThread = {
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await threadsRef.add(newThread);
    res.status(201).json({ id: docRef.id, ...newThread });
  } catch (error) {
    res.status(500).json({ error: `Failed to create thread: ${error.message}` });
  }
});

// Update Thread
app.put('/threads/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { history } = req.body;

  try {
    const threadRef = db.collection('users').doc(req.user.uid).collection('threads').doc(id);
    await threadRef.update({
      history: history || [],
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: 'Thread updated successfully' });
  } catch (error) {
    res.status(500).json({ error: `Failed to update thread: ${error.message}` });
  }
});

// User Login (returns a token)
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Note: Firebase Authentication handles login on the client side.
  // This endpoint is a placeholder for custom token generation if needed.
  res.status(200).json({ message: 'Login successful, use Firebase Auth on client side to get token' });
});

// User Signup
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userRecord = await auth.createUser({ email, password });
    res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ error: `Failed to create user: ${error.message}` });
  }
});

module.exports.handler = serverless(app);
