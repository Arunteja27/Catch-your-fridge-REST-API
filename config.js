let config = {};
config.db = {};

// create properties on the config.db object for the host and database names
const username = "Arunteja_CommFridge_User"; // username for the MongoDB Atlas on cloud
const password = "WXSK1t9mnMBox8Ds"; // password for the MongoDB on cloud
const dbname = "CommunityFridge"; // name of the database that we want to connect to
const connectionURL = `mongodb+srv://${username}:${password}@cluster0.0jbzi.mongodb.net/${dbname}?retryWrites=true&w=majority`;

// create properties on the config.db object for the host and database names
config.db.host = connectionURL;
config.db.name = dbname;

module.exports = config;
