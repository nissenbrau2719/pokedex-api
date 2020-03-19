require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const POKEDEX = require('./pokedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN
  // validate bearer token 
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to next middleware
  next()
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
  const { name, type } = req.query
  let results = POKEDEX.pokemon
  // filter by type if type query parameter is present
  if (type) {
    // make sure user submits valid pokemon type
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .send('Must choose a valid type of Pokemon to filter by type. Visit the "/types" endpoint for a full list of Pokemon types')
    }
    results = results.filter(pokemon => pokemon.type.includes(type))  
  }
  // filter by name if name query parameter is present, convert all to lowercase so results are case insensitive
  if (name) {
    results = results.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))
  }
  // message user if their search parameters yielded 0 results
  if (results.length === 0) {
      res.send("Sorry, there were 0 results for your search. Please try a different search query")
    }

  res.json(results)
}

app.get('/pokemon', handleGetPokemon)

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT)