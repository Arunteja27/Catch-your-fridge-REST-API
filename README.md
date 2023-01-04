# CommunityFridge_REST_API_Arunteja
A REST API for a Community Fridge management system, using Node.js, JavaScript, Express and MongoDB.    

The config.js file is updated with the relevant information from CommunityFridge_REST_API_MongoDB_URL_Arunteja.txt to connect to the MongoDB cluster.

The fridge-router.js file contains the routes used by the Express application.

The server.js file contains more routes used by the express application.

The 3 model files; fridgeModel.js, itemModel.js and typeModel.js are in the "models" subfolder. 

The data subfolder contains the json data only used by the application to initialize the MongoDB database, after which all data manipulation is done on data in the MongoDB database.

Any relevant instructions for running your code:    
npm install node    
Run the server on the command line using node server.js    
Use PostMan to run GET, POST, PUT and DELETE requests through the REST API. The changes can be checked either through PostMan or accessing the MongoDB database.
