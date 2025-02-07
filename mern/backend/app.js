const express=require('express');
const app=express();
const dotenv=require('dotenv');dotenv.config();
const mongoose=require('mongoose');
const connectDB=require('./config/db');
const authRoutes=require('./routes/auth');
const booksRoutes=require('./routes/books');
const cors=require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
connectDB();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/books',booksRoutes);

const port=9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});