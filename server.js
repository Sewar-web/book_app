'use strict';

require('dotenv').config();
const pg = require('pg');
const express = require('express');

const superagent = require('superagent');
const server = express();

server.use(express.static('./public'));
server.set('view engine','ejs');

server.use(express.urlencoded({extended:true}));

const client = new pg.Client( { connectionString: process.env.DATABASE_URL,
  ssl:{rejectUnauthorized: false
  }
} );
const PORT = process.env.PORT || 3030;

server.get('/',(req,res)=>{

  let SQL=`SELECT * FROM book;`;
  client.query(SQL)
    .then (results=>{
      res.render('pages/index',{bookarray:results.rows});
    })
    .catch(err=>{
      res.render('error',{error:err});
    });
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

server.post( '/book', ( req,res )=>{
  let {title,author,isbn,description,image_url} = req.body;
  let SQL = `INSERT INTO book (title,author,isbn,description,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
  let savevalue = [title,author,isbn,description,image_url];
  console.log( savevalue );
  client.query( SQL, savevalue )
    .then( result =>{
      res.redirect(`/book/${result.rows[0].id}`);
    } );
} );

server.get( '/book/:id', ( req,res )=>{
  console.log(req.params);
  let SQL = `SELECT * FROM book WHERE id=$1;`;
  let savevalue = [req.params.id];
  client.query( SQL , savevalue )
    .then( result =>{
      res.render( 'pages/book/detail', {bookarray:result.rows[0]} );

    } );
} );


function Books(getData)
{
  this.name=(getData.volumeInfo.title) ? getData.volumeInfo.title : 'there  is no data';
  this.author=(getData.volumeInfo.authors) ? getData.volumeInfo.authors : 'there is no data';
  this.description=(getData.volumeInfo.description) ? getData.volumeInfo.description : 'there is no data' ;
  // (getData.volumeInfo.imageLinks) ? getData.volumeInfo.imageLinks.smallThumbnail :`https://i.imgur.com/J5LVHEL.jpg` ;
  this.image_url=getData.volumeInfo.imageLinks.thumbnail;
  this.isbn = (getData.volumeInfo.industryIdentifiers) ?getData.volumeInfo.industryIdentifiers[0,1].identifier : 'do not have data' ;
}

server.get('*',(req,res)=>{
  res.status(404).send('There Somthing Error');
});

client.connect()
  .then( () => {
    server.listen( PORT, ()=>{
      console.log( `listening on PORT ${PORT}` );
    } );
  } );
