const mongoose = require('mongoose');
const shortid = require("shortid");



// MongoDB Todo Model
const Todo = mongoose.model("Todo", new mongoose.Schema({
  id: { type: String, unique: true, required: true, default: shortid.generate },
  task: { type: String, required: true }
}));

module.exports = Todo;