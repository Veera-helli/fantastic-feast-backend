const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('recipes');

  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;
  if (username === undefined) {
    return response.status(400).json({
      error: 'username missing',
    });
  }
  const users = await User.find({});
  //console.log(JSON.stringify(users));
  if (users.map((p) => p.username).includes(username)) {
    //console.log('not unique un');
    return response.status(400).json({
      error: 'username must be unique',
    });
  }

  if (name === undefined) {
    console.log('undefined name');
    return response.status(400).json({
      error: 'name missing',
    });
  }

  if (password.length < 3) {
    console.log('too short');
    return response.status(400).json({
      error: 'too short password',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
