//use esversion: 6
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

// Init Middleware
app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./Routes/Api/users'));
app.use('/api/auth', require('./Routes/Api/auth'));
app.use('/api/profile', require('./Routes/Api/profile'));
app.use('/api/post', require('./Routes/Api/post'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));