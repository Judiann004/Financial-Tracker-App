const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./src/config/database');
const auth_routes = require('./routes/auth'); 

dotenv.config();

//routing
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

//test route
app.use('/api/auth', auth_routes);

app.get('/', (req, res) => {
    res.send('Financial Tracker Backend is running!');
});

//sync database and start server
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
});