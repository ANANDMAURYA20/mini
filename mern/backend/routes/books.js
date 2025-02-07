const express=require('express');
const router=express.Router();
const Book=require('../models/book');
const borrowed=require('../models/borrowed');
const authuser=require('../middlewares/authUser');


//get all books
router.get('/',async(req,res)=>{
    try{
        const books=await Book.find();
        res.json(books);
    }catch(err){
        console.error(err.message);
        res.status(400).send('Server Error');
    }
   
})

//create book
router.post('/create',async(req,res)=>{
    try{
        const{title,author,genre,quantity}=req.body;
        const newBook= await new Book({
            title,
            author,
            genre,
            quantity
        });
        newBook.save();
        res.json("book saved");
    }catch(err){
        console.error(err.message);
        res.status(400).send('Server Error');
    }
})

//upadte book
router.put('/:id',async(req,res)=>{
    try{
        const foundBook=await Book.findByIdAndUpdate(req.params.id,{$set: req.body},req.body,{new:true});
        if(!foundBook){
            return res.status(404).json({msg:'Book not found'});
        }
        res.json(foundBook);
    }catch(err){
        console.error(err.message);
        res.status(400).send('Server Error');
    }
})

//delete book
router.delete('/:id',async(req,res)=>{
    try{
        const deletedBook=await Book.findByIdAndDelete(req.params.id);
        if(!deletedBook){
            return res.status(404).json({msg:'Book not found'});
        }
        res.json("Book deleted");
    }catch(err){
        console.error(err.message);
        res.status(400).send('Server Error');
    }
})



//borrowin book
router.put('/borrow/:userid/:bookid',async(req,res)=>{
    try{
        const borrowedBook= await Book.findById(req.params.bookid)
        if(!borrowedBook||borrowedBook.quantity<=0){
            return res.status(404).json({msg:'Book not found or not available'});
        }

        const newBorrowed=new borrowed({
            usersid:req.params.userid,
            bookid:req.params.bookid
        });
        await newBorrowed.save();
        borrowedBook.quantity--;
        await borrowedBook.save();
        res.json(borrowedBook);


    }catch(err){
        console.error(err.message)
        res.status(400).send('server error');
    }

})
//returning book
router.put('/return/:userid/:bookid', async (req, res) => {
    try {

      
        const returnedBook = await Book.findById(req.params.bookid);
        console.log('Book found:', returnedBook);
        if (!returnedBook) {
            return res.status(404).json({ msg: 'Book not found' });
        }

      
        const borrowedBook = await borrowed.findOne({
            usersid: req.params.userid,
            bookid: req.params.bookid
        });
        
        if (!borrowedBook) {
            return res.status(404).json({ msg: 'Book not borrowed' });
        }
        await borrowedBook.deleteOne( { usersid: req.params.userid, bookid: req.params.bookid } );

        returnedBook.quantity++;
        await returnedBook.save();

        console.log('Return process completed successfully');
        res.json(returnedBook);
    } catch (err) {
        console.error('Detailed error:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports=router;