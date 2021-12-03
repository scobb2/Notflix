var express = require('express');
var app = express();
const request = require('request');
const router = express.Router()
const bodyParser = require('body-parser');

// Import in the sql libraries
const { sql,poolPromise } = require('./DB/dbPool')

// const routes = require( "./routes" );

// Set up the server
// process.env.PORT is related to deploying on AWS
var server = app.listen(process.env.PORT || 5000, listen);
module.exports = server;
path = require('path');

//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// Inject your routes in here

// Welcome page basic GET
app.get('/', async(req, res) => {
  res.render('public/index');
});

// Gets movie info for the movie selections page (homepage)
app.get('/homepage', async(req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('EXEC MoviesGet;');

    res.render('public/homepage', { movies: result.recordset});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// Gets user info for the EditInfo page
app.get('/EditInfo', async(req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('EXEC UserGet;');

    res.render('public/editUser', { user: result.recordset[0]});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// POST method for searching operation
app.post('/homepage', async(req, res) => {
  try {
    const pool = await poolPromise;  
    const result = await pool.request()
      .input('input_param', sql.NVarChar, '%' + req.body.txtSearch + '%')  // sanitize??
      .query('EXEC MovieSearchByText @input_param;');

    res.render('public/homepage', { search: true, movies: result.recordset});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// GET on MovieID for when a movie is clicked
app.get('/movie/:id', async(req, res) => {
  try {
    const inputVal = req.params.id; //   const inputVal = sanitizer.sanitize(req.params.id);
    const pool = await poolPromise;
    const result = await pool.request()
    .input('input_parameter', sql.Int, inputVal)
      .query('EXEC MovieGetById @input_parameter;');

    res.render('public/movie', { movie: result.recordset[0]});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// POST method to change user info
app.post('/EditInfo', async(req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request() // check if input params < 256 chars long?    sanitize??
      .input('input_param', sql.NVarChar, req.body.firstName) // params from form
      .input('input_param_2', sql.NVarChar, req.body.lastName)
      .query('EXEC UpdateUserInfo @input_param, @input_param_2;');

    res.redirect('/homepage');
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// GET method for genres page
app.get('/byGenre', async(req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('EXEC GenresGet;');

    res.render('public/byGenre', { genres: result.recordset});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// GET on GenreID for when a genre is clicked
app.get('/filteredGenre/:id', async(req, res) => {
  try {
    const inputVal = req.params.id; //    const inputVal = sanitizer.sanitize(req.params.id);
    const pool = await poolPromise;
    const result = await pool.request()
    .input('input_parameter', sql.Int, inputVal)
      .query('EXEC GenreGetById @input_parameter;');

    res.render('public/filteredGenre', { data: result.recordset});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// GET for when view film is clicked
app.get('/view/:id', async(req, res) => {
  try {
    const inputVal = req.params.id; //    const inputVal = sanitizer.sanitize(req.params.id);
    const pool = await poolPromise;
    const result = await pool.request()
    .input('input_parameter', sql.Int, inputVal)
      .query('EXEC MovieGetTrailerByID @input_parameter;');

    res.render('public/view', { movie: result.recordset[0]});
  }
  catch(err) {
    res.status(500);
    res.setEncoding(err.message);
  }
});

// End routes

// Set the folder for public items
publicDir = path.join(__dirname,'public');
app.use(express.static(publicDir))
app.set('views', __dirname);
app.use(express.urlencoded({ extended: true }))

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://' + host + ':' + port);
}