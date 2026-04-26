require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const subjectsRouter = require('./routes/subjects');
const questionsRouter = require('./routes/questions');
const answersRouter = require('./routes/answers');
const storyRouter = require('./routes/story');
const agentRouter = require('./routes/agent');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/subjects', subjectsRouter);
app.use('/questions', questionsRouter);
app.use('/answers', answersRouter);
app.use('/story', storyRouter);
app.use('/agent', agentRouter);

const PORT = process.env.PORT || 3300;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
