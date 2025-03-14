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
    body('name').notEmpty().isString().trim(),
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
        const {name, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]
        );

        logger.info('User registered: ${email}');
        res.status(201).json({message: 'User created successfully',userId: result.rows[0].id});
    }catch (error) {
        logger.error('Signup error: $(error)');
        next(error);
    }
});

//JWT Verification