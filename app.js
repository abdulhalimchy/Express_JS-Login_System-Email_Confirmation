const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const mongoose = require('mongoose');
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

//env loading
require('dotenv-extended').load();


const app = express();

// passport config
require('./authentication/passport')(passport);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


//Morgan
app.use(morgan('dev'));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');


// Express Session Middlware
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);


// Passport middleware. Note: this must declare after the session
app.use(passport.initialize());
app.use(passport.session());


//Connect flash
app.use(flash());


//Global variables
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


//User Route
app.use('/', require('./routes/user'));


const PORT = process.env.PORT;

app.listen(PORT, console.log(`Server started on port ${PORT}`));