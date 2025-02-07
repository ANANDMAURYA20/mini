const mongoose=require('mongoose');
const Schema= new mongoose.Schema({
 title:String,
 author:String,
    genre:String,
    quantity:Number
});

module.exports =mongoose.model('book',Schema);