const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const userController = require('../controllers/userController');
const loginController = require('../controllers/loginController');
const recipesController = require('../controllers/recipeController');
const validateJWT = require('../middlewares/validateJWT');

const app = express();
app.use('/images', express.static(path.join(__dirname, '..', 'uploads')));
app.use(bodyparser.json());
// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador
app.post('/users', userController.create);
app.post('/login', loginController.login);
app.post('/recipes', validateJWT, recipesController.create);

module.exports = app;
