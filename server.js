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
server.post('/searches' ,handledData);
function handledData(req ,res)
{
  // let select=req.body.select;
  let search=req.body.AuthororTitle;


  const bookURL=`https://www.googleapis.com/books/v1/volumes?q=${search}`;
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
  this.name=(getData.volumeInfo.title) ? getData.volumeInfo.title : 'there  is no data';
  this.author=(getData.volumeInfo.authors) ? getData.volumeInfo.authors : 'there is no data';
  this.description=(getData.volumeInfo.description) ? getData.volumeInfo.description : 'there is no data' ;
  // (getData.volumeInfo.imageLinks) ? getData.volumeInfo.imageLinks.smallThumbnail :`https://i.imgur.com/J5LVHEL.jpg` ;
  this.img=getData.volumeInfo.imageLinks.thumbnail;
}

server.get('*',(req,res)=>{
  res.status(404).send('There Somthing Error');
});

server.listen(PORT,()=>{
  console.log(`Listening on PORT ${PORT}`);
});
