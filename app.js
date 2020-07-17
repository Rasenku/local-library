var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser")
var dotenv = require('dotenv');
var session = require('express-session');
var passport = require('passport');
var cors = require('cors');
var errorHandler = require('errorhandler');
var LocalStrategy = require('passport-local').Strategy;

// var routes = require('./routes/index');
// var users = require('./routes/users');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site

var compression = require('compression');
var helmet = require('helmet');

var app = express();



//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';


// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb+srv://Xuryu:rasenku@cluster0.psoph.mongodb.net/<local_library>?retryWrites=true&w=majority'
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/node-auth')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// var User = require('./models/User');
var routes = require('./routes/index');
var users = require('./routes/users');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site
var User = require('./models/User');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(cookieParser())

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(require('./routes'));
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.



app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
  });
app.post('/login', passport.authenticate('local', { successRedirect:'/',
                                                    failureRedirect: '/login' }));


// The .set method allows us to configure various options with the Express framework.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  // Here we are creating a unique session identifier
  secret: 'shhhhhhhhh',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);




require('./config/passport');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



if (app.get('env') === 'development') {
 app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
   message: err.message,
   error: err
  });
 });
}



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
