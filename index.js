const express= require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const session = require('express-session')


const url = 'mongodb://127.0.0.1:27017/ems'
mongoose.connect(url)
const db = mongoose.connection;
db.on('open',()=>console.log('database is connected'))
db.on('error',()=>console.log('db connection failed'))
const app=express();
app.use(session({
    secret: 'fajdflalsdfjoifnkenkbdfkasdofmcbisygweo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded())

app.get('/',(req,res)=>{
    app.locals.message= req.session.message
    res.render('login')
});
app.get('/index',(req,res)=>{
    let user = req.session.user
    if(user){
        res.render('index')
    }
    else{
        res.send("<h1>Please log in to access this page.....</h1>")
    }
    
});
app.post('/login', async(req,res)=>{
    data = req.body
    console.log(data.email)
    let founduser = await(await db.collection('users').find({'email':data.email})).toArray()
    // console.log(founduser[0].password)
    if(founduser.length>0){
        // console.log( bcrypt.compareSync(data.psw,founduser.password))
       if( bcrypt.compareSync(data.psw,founduser[0]?.password)){
        req.session.message ="Successfully logged In"
        req.session.user = founduser
        res.redirect('index')
        
       }
       else{
        req.session.message ="Incorrect Password"
        res.redirect('/')
       }
    }
    else{
        req.session.message ="Invalid User Credentials"
        res.redirect("/")
    }
})

app.get('/logout',async(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

app.get('/register',(req,res)=>{
    app.locals.message =  req.session.message
    console.log(app.locals.message);
    res.render('register')
});
app.post("/register",async(req,res)=>{
    let data = req.body
    let founduser = await(await db.collection('users').find({'email':data.email})).toArray()
    console.log(founduser)
    if(founduser.length>0){
        req.session.message= "user already exists"
        res.redirect('register')
        return
    }
    let user = {
        'email': data.email,
        'username':data.uname,
        'empid':data.empid,
        'password':bcrypt.hashSync(data.password,10)
    }
    db.collection('users').insertOne(user)
    // console.log(users)
    res.redirect('/')
    });

    
app.listen(5000,()=>
console.log('listening on port 5000\nvisit localhost:5000 0n your browser...'));
// mongodb://localhost:27017