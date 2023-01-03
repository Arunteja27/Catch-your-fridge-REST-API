const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const config = require('./config.js');
let Type = require("./models/typeModel");
let Fridge = require("./models/fridgeModel");
let Item = require("./models/itemModel");

const PORT = process.env.PORT || 8000;

app.locals.types = require('./data/comm-fridge-types.json');
app.locals.fridges = require('./data/comm-fridge-data.json');
console.log(app.locals.fridges);
app.locals.items = require('./data/comm-fridge-items.json');

const fridgesRouter = require("./fridge-router.js");

let db;
app.locals.db = db;

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req,_,next)=> {
    console.log(`${req.method}: ${req.url}`);
    if (Object.keys(req.body).length > 0){
        console.log('Body:');
        console.log(req.body);
    }
    next();
});

//Mount the fridge router to the path /fridges
//All requests starting with /fridges will be forwarded to this router
app.use("/fridges", fridgesRouter);



//Adding a new item into the items collection, not adding an item to a fridge
app.post('/items', (req,res)=> {
  let newBody = req.body;

  if(  ("name" in newBody && "type" in newBody && "img" in newBody) == false || Object.keys(newBody).length != 3 ){
    res.status(400).send();
    return;
  }

  let newId = "" + Math.floor((Math.random() * (999) + 1));
  newBody.id = newId;
  let newBodyArr = [];
  newBodyArr.push(newBody);
  let a ='^' + newBody.name + '$';
  Item.findOne( {"name" :{$regex : a, $options : "i" } }, function(err,item){
    if(err){
      res.status(400).send();
      return;
    }

    if(item){
      res.status(409).send();
      return;
    }

    Type.findOne().where('id').eq(newBody.type).exec(function(err,type){
      if(err){
        res.status(400).send();
        return;
      }

      if(!type){
        res.status(400).send();
        return;
      }

      Item.insertMany(newBodyArr, function(err,result){
        if(err){
          res.status(400).send();
          return;
        }
        res.status(200).json(result);


      });



    });

  });

});

//Search for an item in the items collection
app.get('/search/items', (req,res)=> {
  let query = req.query;
  if(Object.keys(query).length == 0 || Object.keys(query).length > 2 || ("type" in query && "name" in query) == false){
    res.status(400).send();
    return;
  }
  let type = query.type;
  let name = query.name;

  Type.findOne().where('name').eq(type).exec(function(err,typeName){
    if(err){
      res.status(400).send();
      return;
    }

    if(!typeName){
      res.status(400).send();
      return;
    }

    let typeId = typeName.id;
    let a = '.*' + name + '.*';

    Item.find( {"name" :{$regex : a, $options : "i" } } ,function(err,items){
      if(err){
        res.status(400).send();
        return;
      }

      let finalItemArray = [];

      for(let i of items){
        if(i.type == typeId){
          finalItemArray.push(i);
        }
      }
      res.status(200).json(finalItemArray);

    });

  });


});


//Start the connection to the database
mongoose.connect(config.db.host, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default Mongoose connection (can then be shared across multiple files)
db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  //We're connected
  console.log("Connected to the database...");

  // Intialize the types collection in the database by using the data in the file: comm-fridge-types.json
  Type.find({}, function (err, result){
    if (err){console.log(err);}
    else{
      console.log("Result :", result);
      if(result.length === 0){
        console.log("Intializing the types collection...");
        Type.insertMany(app.locals.types, function(err, result){
          if(err){
            console.log(err);
            return;
          }
          console.log(result);
        });
      }
    }
  });
  // Intialize the items collection in the database by using the data in the file: comm-fridge-items.json
  Item.find({}, function (err, result){
    if (err){console.log(err);}
    else{
      console.log("Result :", result);
      if(result.length === 0){
        console.log("Intializing the items collection...");
        Item.insertMany(app.locals.items, function(err, result){
          if(err){
            console.log(err);
            return;
          }
          console.log(result);
        });
      }
    }
  });
  // Intialize the fridges collection in the database by using the data in the file: comm-fridge-data.json
  Fridge.find({}, function (err, result){
    if (err){console.log(err);}
    else{
      console.log("Result :", result);
      if(result.length === 0){
        console.log("Intializing the fridges collection...");
        Fridge.insertMany(app.locals.fridges, function(err, result){
          if(err){
            console.log(err);
            return;
          }
          console.log(result);
          app.listen(PORT, ()=> {
            console.log(`Server listening on http://localhost:${PORT}`)
            });
        });
      }
      else {
        app.listen(PORT, ()=> {
          console.log(`Server listening on http://localhost:${PORT}`)
          });
      }
    }
  });
});
// terminates a connection to the database when the node application finishes
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});
