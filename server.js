'use strict';

require('dotenv').config();

const express = require('express');

const superagent = require('superagent');
const server = express();

server.use(express.static('./public'));
server.set('view engine','ejs');

server.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 3030;

server.get('/',(req,res)=>{
  res.render('./pages/index');
});



server.get('/searches/new' ,(req,res) =>{
  res.render('./pages/searches/new');
});
server.get('/searches/show' ,handledData);
function handledData(req ,res)
{
  let select=req.query.select;
  let search=req.query.AuthororTitle;


  const bookURL=`https://www.googleapis.com/books/v1/volumes?q=${search}:${select}`;
  superagent.get(bookURL)
    .then(getData => {
      console.log(bookURL);
      let bookDataArr=getData.body.items.map(val => {
        return new Books(val);
      });
      res.render('pages/searches/show' , {bookarray:bookDataArr});
    });


}


function Books(getData)
{
  this.name=getData.volumeInfo.title;
  this.author=getData.volumeInfo.authors;
  this.description=getData.volumeInfo.description;
  this.img=getData.volumeInfo.imageLinks.thumbnail;
}

server.get('*',(req,res)=>{
  res.render('/pages/error');
});

server.listen(PORT,()=>{
  console.log(`Listening on PORT ${PORT}`);
});
