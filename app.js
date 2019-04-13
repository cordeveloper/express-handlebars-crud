const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const port = 5000;
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');



// Update Promise moongose
mongoose.Promise = global.Promise;

//Load Model
require('./models/idea');
const Idea = mongoose.model('ideas');

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
 useNewUrlParser: true
})
.then( ()=>console.log('Mongodb Connected..') )
.catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
}));

// Body-parser Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Method Override Middleware
app.use(methodOverride('_method'))

app.set('view engine', 'handlebars');
app.set('views', 'views');

// Idea index page
app.get('/ideas',(req,res) => {
  Idea.find({})
  .sort({date: 'desc'})
  .then(ideas => {
    res.render('ideas-index',{
      ideas
    })
  })
});

// Index Route/views/ideas/
app.get('/', (req, res) => {
  const title = "Welcome";
  res.render('index',{
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
 res.render('about');
});

// Add Idea Form
app.get('/ideas/add',(req,res)=> {
  res.render('ideas-add',{});
})

// Edit Idea Form
app.get('/ideas/edit/:id',(req,res)=> {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas-edit',{idea});
  })
})


// Process form
app.post('/ideas', (req, res) => {
  let errors = [];
  if(!req.body.title){
    errors.push({text: 'Please add a title'})
  }
  if(!req.body.details){
    errors.push({text: 'Please add some details'})
  }
  if(errors.length > 0){
    res.render('ideas-add', {
      errors,
      title: req.body.title,
      details: req.body.details
    })
  } else {
   const newUser = {
     title: req.body.title,
     details: req.body.details
   }
   new Idea(newUser)
   .save()
   .then(idea => {
     res.redirect('/ideas')
   })
  }
});

// Edit form process
app.put('/ideas/:id', (req,res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then( idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save()
    .then(idea => {
      res.redirect('/ideas');
    })
  })
});

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
 Idea.remove({
   _id: req.params.id
 })
 .then( () => {
   res.redirect('/ideas');
 })
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

