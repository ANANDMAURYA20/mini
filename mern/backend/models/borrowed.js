const users = require("./users");
const mongoose=require('mongoose');

const Schema=mongoose.Schema({
    usersid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    bookid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"books",
        required:true,
        date:{
            type:"date",
            default:Date.now
        },
        returnDate:{
            type:"date",
            default:Date.now
        }
    }
})

module.exports=mongoose.model('borrowed',Schema);