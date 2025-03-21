const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./src/config/database');

dotenv.config();

//routing
const app = express();
const PORT = process.env.PORT || 5000;

//test route
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Financial Tracker Backend is running!');
});

//sync database and start server
sequelize.sync().them(() => {
    app.listen(PORT, () => {
        console.log('Server running on port $(PORT)');
    })
});