const mongoose=require('mongoose');

const connentDB=async(req,res)=>{
    try{
     await mongoose.connect(process.env.MONGO_URl,
     console.log('MongoDB connection SUCCESS'));
    }catch(err){
        console.log(err);
    }
}
mongoose.connection.on('connected',()=>{
    console.log('mongoDB connected');
})
mongoose.connection.on('disconnected',()=>{
    console.log('mongoDB disconnected');
})

module.exports=connentDB;