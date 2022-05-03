var express = require('express');
var router = express.Router();
const userModel = require('./users')
const questionModel = require('./question')
const multer = require('multer')
const sendMail = require("./nodemailer");
var passport = require('passport')
const {uuid} = require('uuidv4')
const localstrategy = require('passport-local');
passport.use(new localstrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }

})
const upload = multer({ storage: storage })


router.get('/', function (req, res, next) {
  res.render('index');
});

router.post('/register', function (req, res) {
  var data = new userModel({
    name: req.body.name,
    username: req.body.username,
    contact: req.body.contact,
    email: req.body.email,
    gender: req.body.gender
  })
  userModel.register(data, req.body.password)
    .then(function (q) {
      passport.authenticate('local')(req, res, function () {
        res.render('profile', { q })
      })
    })
    .catch(function (e) {
      res.send(e);
    })
})

router.get('/login', function (req, res) {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res, next) { })

router.get('/profile', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'question',
      populate: {
        path: 'username'
      }
    })
    .then(function (q) {
      res.render('profile', { q })
    })
})

router.post('/createquestion', upload.single('image'), function (req, res) {
  if (req.file !== undefined) {
    userModel.findOne({ username: req.session.passport.user })
      .then(function (user) {
        questionModel.create({
          question: req.body.question,
          image: req.file.filename,
          username: user._id
        })
          .then(function (questiondata) {
            user.question.push(questiondata)
            user.save()
              .then(function () {
                res.redirect('/profile')
              })
          })
      })
  }
  else {
    userModel.findOne({ username: req.session.passport.user })
      .then(function (user) {
        questionModel.create({
          question: req.body.question,
          username: user._id
        })
          .then(function (questiondata) {
            user.question.push(questiondata)
            user.save()
              .then(function () {
                res.redirect('/profile')
              })
          })
      })
  }
})

router.get('/showall',function(req, res){
  questionModel.find()
  .populate({
    path: 'username',
    populate: {
      path: 'question'
    }
  })
  .then(function(alldata){
    res.render('showall', {alldata})
    // res.send(alldata)
  })
})

router.get('/like/:id', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
     .then(function (user) {
        questionModel.findOne({ _id: req.params.id })
           .then(function (question) {
              if (question.likes.indexOf(user._id)==-1 && question.dislikes.indexOf(user._id)==-1){
                question.likes.push(user._id);
              }
              else{
                question.likes.splice(user._id, 1);
              }
              question.save()
                 .then(function () {
                    res.redirect(req.headers.referer)
                 })
           })
     })
})

router.get('/dislike/:id', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
     .then(function (user) {
        questionModel.findOne({ _id: req.params.id })
           .then(function (question) {
              if (question.dislikes.indexOf(user._id)==-1 && question.likes.indexOf(user._id)==-1){
                question.dislikes.push(user._id);
              }
              else{
                question.dislikes.splice(user._id, 1);
              }
              question.save()
                 .then(function () {
                  res.redirect(req.headers.referer)
                 })
           })
     })
})

router.get('/delete/:id', function (req, res) {
  questionModel.findOneAndDelete({ _id: req.params.id })
     .then(function (data) {
      res.redirect('/profile')
     })
})

router.post('/answer/:id', function(req, res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinUser){
    questionModel.findOne({_id:req.params.id})
    .then(function(quesfound){
      var a = {
        answer:req.body.answer,
        username:loggedinUser.username
      }

      quesfound.answer.push(a)
      quesfound.save()
      .then(function(ans){
        res.redirect('/show')
      })
      
    })
  })
})

router.get('/show', function(req,res){

  questionModel.find()
  .then(function(alldata){
    res.render('showall', {alldata})
  })

})

router.get('/reset',function(req,res){
  res.render('reset')
})

router.post('/reset', function(req,res){
  userModel.findOne({email:req.body.email})
  .then(function(userFound){
    if (userFound!==null){
      var secrt = uuid()
      userFound.secret = secrt
      userFound.expiry = Date.now() + 24*60*60*1000
      userFound.save()
      .then(function(){
        sendMail( req.body.email,`http://localhost:3000/reset/${userFound._id}/${secrt}`)
        .then(function(){
          res.send('Link emailed to you, please check your mail ! !')
        })
      })
    }
  })
})

router.get('/reset/:userid/:secret',function(req,res){
  userModel.findOne({_id:req.params.userid})
  .then(function(user){
    if (user.secret === req.params.secret){
      res.render('resetpswrd', {user})
    }
  })
})

router.post('/resetpswrd/:userid', function(req,res){
  userModel.findOne({_id:req.params.userid})
  .then(function(usermila){
    if(req.body.password===req.body.confirmpswrd){
      usermila.setPassword(req.body.password, function(){
        usermila.save()
        .then(function(updatedUser){
          req.login(updatedUser,function(err){
            if(err){
              return next(err)
            }
            else{
              res.redirect('/profile')
            }
          })
        })
      })
    }
  })
})

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login')
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else {
    res.redirect('/')
  }
}
module.exports = router;
