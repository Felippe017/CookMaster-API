const statusCode = require('http-status-codes');
const recipeService = require('../services/recipeService');

const create = async (req, res) => {
	const { name, ingredients, preparation } = req.body;
	const { _id: id } = req.user;
	console.log(id);
	const recipe = await recipeService.create({ name, ingredients, preparation });
	const { _id } = recipe;

	if (recipe.message === 'Invalid entries. Try again.') {
		return res.status(statusCode.BAD_REQUEST).json(
			{ message: recipe.message },
		);
	} 
	return res.status(statusCode.CREATED).json({ recipe: 
        { name, ingredients, preparation, userId: id, _id } });
};

module.exports = { create };