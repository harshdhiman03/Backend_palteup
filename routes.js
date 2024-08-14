const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

// User signup
router.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.execute('INSERT INTO users SET ?', { first_name, last_name, email, password: hashedPassword });
  const otp = otpGenerator.generate(6);
  await db.execute('UPDATE users SET otp = ? WHERE id = ?', [otp, user.insertId]);
  res.send({ message: 'User created successfully. Please verify your email.' });
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user.id, userType: 'user' }, process.env.SECRET_KEY, { expiresIn: '1h' });
  res.send({ token });
});

// Speaker profile setup
router.post('/speakers/setup', authenticate('speaker'), async (req, res) => {
  const { expertise, price_per_session } = req.body;
  await db.execute('UPDATE speakers SET expertise = ?, price_per_session = ? WHERE user_id = ?', [expertise, price_per_session, req.user.id]);
  res.send({ message: 'Speaker profile setup successfully' });
});

// Middleware to authenticate users and speakers
function authenticate(userType) {
  return async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);
      if (req.user.user_type !== userType) {
        return res.status(403).send({ message: 'Forbidden' });
      }
      next();
    } catch (err) {
      return res.status(401).send({ message: 'Invalid token' });
    }
  };
}
// Speaker listing
router.get('/speakers', async (req, res) => {
    const speakers = await db.execute('SELECT * FROM speakers');
    res.send(speakers);
  });
  
  // Speaker profile
  router.get('/speakers/:id', async (req, res) => {
    const speaker = await db.execute('SELECT * FROM speakers WHERE id = ?', [req.params.id]);
    res.send(speaker);
  });
  // Book a session
router.post('/sessions', authenticate('user'), async (req, res) => {
    const { speaker_id, start_time, end_time, date } = req.body;
    const user_id = req.user.id;
    const session = await db.execute('INSERT INTO sessions SET ?', { speaker_id, user_id, start_time, end_time, date });
    await blockTimeSlot(speaker_id, start_time, end_time, date);
    sendEmailNotification(speaker_id, user_id, start_time, end_time, date);
    createGoogleCalendarEvent(speaker_id, user_id, start_time, end_time, date);
    res.send({ message: 'Session booked successfully' });
  });
  
  // Block time slot
  async function blockTimeSlot(speaker_id, start_time, end_time, date) {
    await db.execute('UPDATE time_slots SET available = FALSE WHERE speaker_id = ? AND start_time = ? AND end_time = ? AND date = ?', [speaker_id, start_time, end_time, date]);
  }
  
  // Send email notification
  async function sendEmailNotification(speaker_id, user_id, start_time, end_time, date) {
    // Implement email notification logic here
  }
  
  // Create Google Calendar event
  async function createGoogleCalendarEvent(speaker_id, user_id, start_time, end_time, date) {
    // Implement Google Calendar event creation logic here
  }
  // Block time slot
router.post('/time-slots/block', authenticate('speaker'), async (req, res) => {
    const { start_time, end_time, date } = req.body;
    const speaker_id = req.user.id;
    await blockTimeSlot(speaker_id, start_time, end_time, date);
    res.send({ message: 'Time slot blocked successfully' });
  });