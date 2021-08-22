const mongoose = require('mongoose');

const { Schema } = mongoose;

const ExerciseSchema = new Schema({
  userID: String,
  description: String,
  duration: Number,
  date: Date,
});
const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Name is required'],
  },
});

const User = mongoose.model('userdb', UserSchema);
const Exer = mongoose.model('exercisedb', ExerciseSchema);

module.exports = { User, Exer };
