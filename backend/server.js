//Importing libraries and dependencies
const express = require('express');
const {Pool} = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {body, sanitizeBody, validationResult} = require('express-validator')
const helmet = require('helmet');
const {pipeline} = require('@huggingface/inference');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const cors = require('cors');
const {v4: uuidv4} = require('uuid')
const {cleanEnv, str, num} = require('envalid');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

//setting environment variables and configuration
const app = express();
const PORT = process.env.PORT || 3000;

//logging setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.console(),
        new winston.transports.File({filename: 'backend.log'}),
    ],
});

//PostgreSQL Connection Pool
const pool = new  Pool({
    connectionString: process.env.backend/Backend_database.sql
});

//security headers
app.use(helmet());
app.use(express.json());
app.use(cors({origin: process.env.frontend, credentials: true}))

//request ID and logging
app.use((req, resizeBy, next) => {
    req.requestId = uuidv4();
    logger.info('Request ${req.requestId} started: ${req.method} ${req.url}');
    next();
});

const limiter = rateLimit({
    WindowMs: 15 *60 *1000,
    max: 100,
    message: "Too many requests, please try again later.",
});
app.use('/api', limiter);

//input validation
const validateSignup = [
    body('first_name').notEmpty().isString().trim(),
    body('last_name').notEmpty().isString().trim(),
    body('user_name').notEmpty().isString().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min: 8}),
];

//user signup authentication
app.post('/signup', validateSignup, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const {first_name, last_name, user_name, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (first name, last name, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [first_name, last_name, user_name, email, hashedPassword]
        );

        logger.info('User registered: ${username}');
        res.status(201).json({message: 'User created successfully!',userId: result.rows[0].id});
    }catch (error) {
        logger.error('Signup error: $(error)');
        next(error);
    }
});

//JWT Verification
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split('')[1];
    if (!token) return res.status(401).json({message: 'Access denied. No token provided.'});

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: 'Invalid token.'});
        req.user = user;
        next();
    });
}

//validate login input
const validateLogin = [
    body('usernameorEmail').notEmpty().withMessage('Username or email is required')
    .custom((value) => {
        //check if it is a valid email
        const isEmail = body('usernameorEmail').isEmail().run(req);
        //check if the input is a valid username (alphanumeric, underscores and hyphens)
        const isUsername = value.length >= 3 && value.length <= 20;

        if (isEmail && isUsername) {
            throw new Error('Invalid username or email');
        }
        return true;
    }),

    body('password').notEmpty().withMessage('Password is required'),

];

//User login endpoint
app.post('/login', validateLogin, async(req, res, next) =>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors:array()});
        }

        const {usernameorEmail, password} = req.body;

        //find the user by username or email
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 or email = $1',
            [usernameorEmail]
        );

        const user = result.rows[0];

        //compare the provided password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid username/email or password'})
        }

        //Generate a JWT token
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '10min'});

        //log the login event
        logger.info('User logged in: ${user.username}');

        //return the token to the client
        res.status(200).json(({message: 'Login successful', token}));

    }catch (error) {
        logger.error('Login error: ${error}');
        next(error);
    }
});