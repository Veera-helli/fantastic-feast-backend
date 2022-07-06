const recipesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');
const User = require('../models/user');
require('dotenv').config();

// const getTokenFrom = (request) => {
//   console.log('Getting token');
//   const authorization = request.get('authorization');
//   if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
//     return authorization.substring(7);
//   }
//   return null;
// };

recipesRouter.get('/', async (request, response) => {
  const recipes = await Recipe.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(recipes);
});

recipesRouter.post('/', async (request, response) => {
  const body = request.body;

  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

  const recipe = new Recipe({
    title: body.title,
    url: body.url,
    weekday: body.weekday,
    user: user._id,
  });

  try {
    const savedRecipe = await recipe.save();
    user.recipes = user.recipes.concat(savedRecipe._id);
    await user.save();
    response.status(201).json(savedRecipe);
  } catch (exception) {
    response.status(400).json();
  }
});

recipesRouter.delete('/:id', async (request, response) => {
  const deletableRecipe = await Recipe.findById(request.params.id);
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  } else if (deletableRecipe.user.toString() !== decodedToken.id.toString()) {
    return response.status(401).json({ error: 'unauthorized to delete' });
  } else {
    const user = await User.findById(decodedToken.id);
    user.recipes = user.recipes.filter(
      (recipe) => recipe._id !== deletableRecipe._id
    );
    await Recipe.findByIdAndRemove(request.params.id);
    response.status(204).end();
  }
});

recipesRouter.put('/:id', (request, response, next) => {
  const body = request.body;

  const recipe = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  Recipe.findByIdAndUpdate(request.params.id, recipe, { new: true })
    .then((updatedRecipe) => {
      response.json(updatedRecipe);
    })
    .catch((error) => next(error));
});

module.exports = recipesRouter;
