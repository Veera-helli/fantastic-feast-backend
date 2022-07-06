const mongoose = require('mongoose');
require('dotenv').config();

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: function () {
      return !this.url;
    },
  },
  url: {
    type: String,
    required: function () {
      return !this.title;
    },
  },
  weekday: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

recipeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Recipe', recipeSchema);
