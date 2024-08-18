const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));

app.set('view engine', 'ejs');

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db('users').insert({ username, password: hashedPassword });
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Database error');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db('users').where({ username }).first();
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials');
        }

        req.session.user = user.username;
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Database error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

app.get('/', (req, res) => {
    if (req.session.user) {
        res.render('main', { username: req.session.user });
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Unable to log out');
        }
        res.redirect('/login');
    });
});