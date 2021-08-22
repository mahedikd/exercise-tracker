require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { User, Exer } = require('./model');

const app = express();
const { log } = console;

const mySecret = process.env['MONGODB_URI'];
const PORT = process.env['PORT'] || 4000;


// db -----------------------------
mongoose.connect(mySecret, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// --------------------------------
const defaulHome = __dirname + '/view/index.html';


app.use(express.static('public'));
app.use(cors({optionsSuccessStatus: 200}));
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.sendFile(defaulHome);
});

let uid = {};

// api/user routre ---------------------------------------

app
  .route('/api/users')
  .get(async (req, res) => {
    // get all user
    const resp = await User.find({}, { __v: 0 });
    res.json(resp);
  })
  .post(async (req, res) => {
    // submit user
    const username = req.body.username || '';
    const usr = await User.findOne({ username });

    if (usr) {
      // if usernem already defined, send error msg
      res.status(400).json({ error: 'user already defined' });
      return;

    } else if (username === '') {
      // if username is empty, send error msg
      res.status(400).json({ error: 'username required' });

    } else {
      // if theres no user , create user
      const resp = await User.create(req.body);
      uid = { id: resp._id };
      const { username, _id } = resp;
      res.json({ _id, username });

    }
  });

// api/user/:_id/logs route -------------------------------------

app.get('/api/users/:_id/logs', async (req, res) => {
  let { from, to, limit } = req.query;
  const id = req.params._id;

  from = !(new Date(from) == 'Invalid Date') ? new Date(from) : new Date('1111-11-11');
  to = !(new Date(to) == 'Invalid Date') ? new Date(to) : new Date();

  const user = await User.findById(id, { __v: 0 });
  const exerLogs = await Exer.find({ userID: id })
    .find({
      date: { $gte: from, $lte: to },
    })
    .sort({ date: -1 })
    .limit(+limit);

  const logg = exerLogs.map((elem) => {
    const newDate = new Date(elem.date).toDateString();
    return {
      description: elem.description,
      duration: elem.duration,
      date: newDate,
    };
  });
  const count = logg.length;

  const result = { _id: user._id, username: user.username, count, log: logg };

  res.json(result);
});

// api/users/:_id/exercises route ----------------------------------------
app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;

	const user = await User.findById(id, { __v: 0 });

  if (!user) {
    res.json({ error: 'user not defined' });
    return;
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration, 10) || 0;
  const date =
    new Date(req.body.date) == 'Invalid Date'
      ? new Date().toDateString()
      : new Date(req.body.date).toDateString();

  const upresp = await Exer.create({
    userID: id,
    description,
    duration,
    date,
  });

  res.json({ _id: id, username: user.username, date, duration, description });

});

// // sends  last submited user id to ui --------------------------------------

app.get('/api/uid', (req, res) => {
  res.json(uid);
});

app.listen(PORT, () => log(`listening on port ${PORT}`));
