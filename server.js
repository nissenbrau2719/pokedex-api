require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');

console.log(process.env.API_TOKEN);

const app = express();

app.use(morgan('dev'));

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN

  console.log('validate bearer token middleware')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  next()
})

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
  const { name, type } = req.query
  let results = POKEDEX.pokemon
  if (type) {
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .send('Must choose a valid type of Pokemon to filter by type. Visit the "/types" endpoint for a full list of Pokemon types')
    }
    results = results.filter(pokemon => pokemon.type.includes(type))  
  }
  
  if (name) {
    results = results.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))
  }

  if (results.length === 0) {
      res.send("Sorry, there were 0 results for your search. Please try a different search query")
    }

  res.json(results)
}

app.get('/pokemon', handleGetPokemon)

const PORT = 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})