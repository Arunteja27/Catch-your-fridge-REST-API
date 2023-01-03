// This module is cached as it has already been loaded
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
let router = express.Router();

let Type = require("./models/typeModel");
let Fridge = require("./models/fridgeModel");
let Item = require("./models/itemModel");

app.use(express.json()); // body-parser middleware

// Get /fridges and return the all of the fridges based on requested format
router.get('/', (req,res)=> {
  if(req.accepts('json')){

    Fridge.find(function(err, result){
      if(err){
        throw err;
      }
      res.status(200).set("Content-Type","application/json").json(result);

    } );
  }

});

// Middleware function: this function validates the contents of the request body associated with adding a new fridge into the application. At the minimimum, it currently validates that all the required fields for a new fridge are provided.
function validateFridgeBody(req,res,next){
    let properties = ['name','can_accept_items','accepted_types','contact_person','contact_phone','address'];

    for(property of properties){
        if (!req.body.hasOwnProperty(property)){
            return res.status(400).send("Bad request");
        }
    }
    next();
}

// Middleware function: this validates the contents of request body, verifies item data
function validateItemBody(req,res,next){
    let properties = ['id','quantity'];
    for (property of properties){
        if (!req.body.hasOwnProperty(property) || Object.keys(req.body).length > properties.length)
			return res.status(400).send();
    }
    next();
}

function validateAcceptedTypes(req,res,next){
  acceptedTypes = req.body.acceptedTypes;
  let index =0;
  for(let i of acceptedTypes){
    Type.findOne().where('id').eq(i).exec( function(err,result){
      if(err){throw err;}

      if(!result){
        res.status(400).send();
        return;
      }else{
        index++;
        if(index == acceptedTypes.length){
          req.body.id = "" + Math.floor( (Math.random() * (99000) + 1000) );
          console.log("new fridge id is: " + req.body.id);
          next();
        }
      }

    });

  }

}

// Adds a new fridge, returns newly created fridge
router.post('/',validateAcceptedTypes, (req,res)=> {
  let data = [];
  data.push(req.body);

  if(data[0].items){
    res.status(400).send();
    return;
  }

  Fridge.insertMany(data, function(err, result){
    if(err){
      res.status(400).send();
      return;
    }
    res.status(200).set("Content-Type","application/json").json(result);


  });
});

// Get /fridges/{fridgeID}. Returns the data associated with the requested fridge.
router.get("/:fridgeId", function(req, res, next){
  let fridgeId = req.params.fridgeId;
  let queriedFridge = Fridge.findOne().where('id').eq(fridgeId);
  queriedFridge.exec(function(err,result){
    if(err){
      throw err;
    }
    if(result){
      res.status(200).set("Content-Type","application/json").json(result);
    }else{
      res.status(404).send();
    }
  });

});

function validateFridgeIDPUT(req,res,next){
  let fridgeId = req.params.fridgeId;
  console.log("fid: "+fridgeId);

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,result){
    if(err){
      throw err;
    }
    if(!result){
      res.status(400).send();
      return;
    }else{
      next();
    }
  });

}


// Updates a fridge and returns the data associated.
router.put("/:fridgeId", validateFridgeIDPUT, (req, res) =>{
	let fridgeId = req.params.fridgeId;
  let updateObj = req.body;

  Fridge.findOne().where("id").eq(fridgeId).exec(function(err,fridge){
    if(err){
      res.status(400).send();
      return;
    }

    for(const prop in updateObj){
    if(prop == 'street' || prop == 'postal_code' || prop == 'city' || prop == 'province' || prop == 'country' || prop == 'contactPerson' || prop == 'contactPhone'){
      continue;
    }else if (!(prop in fridge)  ) {
      res.status(400).send();
      return;
    }
  }

    for(const prop in updateObj){

        if(prop == 'address' || prop == 'contactInfo'){
          for(const p in updateObj[prop]){
            fridge[prop][p] = updateObj[prop][p];
          }
        }else if (prop == 'street' || prop == 'postalCode' || prop == 'city' || prop == 'province' || prop == 'country') {
          fridge.address[prop] = updateObj[prop];
          console.log("done!");
        }else if(prop == 'contactPerson' || prop == 'contactPhone'){
          fridge.contactInfo[prop] = updateObj[prop];
        }else{
          fridge[prop] = updateObj[prop];
        }


    }

    console.log("updated fridge! : ");
    console.log(fridge);

    fridge.save(function(err,result){
      if(err){
        res.status(400).send();
        return;
      }
      res.status(200).send();
      console.log("fridge updated!");
    });

  });


});

// Adds an item to specified fridge
router.post("/:fridgeId/items", validateItemBody, (req,res)=>{
	let fridgeId = req.params.fridgeId;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,fridge){
    let acceptedTypes = fridge.acceptedTypes;
    let itemsArr = fridge.items;
    let typeExists = false;
    let itemExists = false;
    for(let a of acceptedTypes){
      if(a == req.body.id){
        typeExists = true;
        break;
      }
    }

    for(let i of itemsArr){
      if(i.id == req.body.id){
        itemExists = true;
        break;
      }
    }

    if(!typeExists){
      res.status(400).send();
      return;
    }

    if(itemExists){
      res.status(409).send();
      return;
    }

    fridge.items.push(req.body);

    fridge.save(function(err,result){
      if(err){
        res.status(400).send();
        return;
      }
      res.status(200).send();
    });


  });


});

function validateID(req,res,next){
  let fridgeId = req.params.fridgeId;
  let itemId = req.params.itemId;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,fridge){
    if(err){
      res.status(400).send();
      return;
    }
    if(!fridge){
      res.status(404).send();
      return;
    }

    let newItemInFridge = false;
    for(let i of fridge.items){
      if(i.id == itemId){
        newItemInFridge = true;
      }
    }

    if(!newItemInFridge){
      res.status(404).send();
      return;
    }

    Item.findOne().where('id').eq(itemId).exec(function(err,item){
      if(err){
        res.status(400).send();
        return;
      }

      if(!item){
        res.status(404).send();
        return;
      }

      next();

    });


  });

}


// Deletes an item from specified fridge
router.delete("/:fridgeId/items/:itemId", validateID, (req,res)=>{
	console.log("control flow is now in the delete path!");
  let fridgeId = req.params.fridgeId;
  let itemId = req.params.itemId;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err, fridge){
    for(let i of fridge.items){
      if(i.id == itemId){
        fridge.items.splice(fridge.items.indexOf(i),1);
        break;
      }
    }

    fridge.save(function(err,result){
      if(err){
        res.status(400).send();
        return;
      }
      res.status(200).send();
    });


  });

});

function validateFridgeAndItems(req,res,next){
  let query = req.query;

if( (Object.keys(query).length != 1 || Object.keys(query)[0] != 'item') && query.item != undefined ){
  res.status(400).send();
  return;
}

  let fridgeId = req.params.fridgeId;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,fridge){
    if(err){
      res.status(400).send();
      return;
    }
    if(!fridge){
      res.status(404).send("fridge does not exist");
      return;
    }

    if(query.item != undefined){
      let index =0;
      for(let i of query.item){
        Item.findOne().where('id').eq(i).exec(function(err,result){
          if(err){
            res.status(400).send();
            return;
          }
          if(!result){
            res.status(404).send("item does not exist in items collection");
            return;
          }else{
            index++;
            if(index == query.item.length){
              //now checking if items actually exist in fridge
              let fridgeItemIds = [];
              for(let b of fridge.items){
                fridgeItemIds.push(parseInt(b.id));
              }

              let itemExists = true;
              for(let it of query.item){

                if(!fridgeItemIds.includes(parseInt(it))){
                  itemExists = false;
                  break;
                }
              }
              if(itemExists == false){
                res.status(404).send("item not in fridge");
                return;
              }else{
                next();
              }
            }
          }
        });


      }

    }else{
      next();
    }

  });

}

//Deletes a list of items from a fridge
router.delete("/:fridgeId/items", validateFridgeAndItems, (req,res)=>{
  let query = req.query;
  let fridgeId = req.params.fridgeId;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,fridge){

    if(Object.keys(query) == 0){
      fridge.items = [];
    }else{

      for(let q of query.item){
        for(let a of fridge.items){
          if(a.id == q){
            let index = fridge.items.indexOf(a);
            fridge.items.splice(index,1);
          }
        }
      }

    }

    fridge.save(function(err,saved){
      if(err){
        res.status(400).send();
        return;
      }
      res.status(200).send();
      return;
    });


  });


});

function checkFridgeIdAndItemId(req,res,next){
  let body = req.body;
  if(Object.keys(body).length != 1 || Object.keys(body)[0] != "quantity"){
    res.status(400).send();
    return;
  }

  let fridgeId = req.params.fridgeID;
  let itemId = req.params.itemID;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,fridge){
    if(err){
      res.status(400).send();
      return;
    }

    console.log("fridge: " + fridge);

    if(!fridge){
      res.status(404).send();
      return;
    }

    Item.findOne().where('id').eq(itemId).exec(function(err,item){
      if(err){
        res.status(400).send();
        return;
      }

      if(!item){
        res.status(404).send();
        return;
      }

      let itemExists = false;
      for(let i of fridge.items){
        if(i.id == itemId){
          itemExists = true;
        }
      }

      if(itemExists == false){
        res.status(404).send();
        return;
      }

      next();

    });

  });

}



//Updating the quantity of an item in the fridge
router.put("/:fridgeID/items/:itemID", checkFridgeIdAndItemId, (req, res) =>{
  let fridgeId = req.params.fridgeID;
  let itemId = req.params.itemID;
  let newQuantity = req.body.quantity;

  Fridge.findOne().where('id').eq(fridgeId).exec(function(err,fridge){
    if(err){
      res.status(400).send();
      return;
    }

    for(let i of fridge.items){
      if(newQuantity <= 0){
        res.status(400).send();
        return;
      }else if(i.id == itemId){
        i.quantity = newQuantity;
        break;
      }
    }

    fridge.save(function(err,result){
      if(err){
        res.status(400).send();
        return;
      }
      res.status(200).json(result);
      return;
    });


  });

});




module.exports = router;
