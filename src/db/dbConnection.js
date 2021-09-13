const mongoose = require("mongoose");
const config = require("../config/appConfig");

const initDb = () => {
  const connectionString = config.db.hostUrl;
  try {
    mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    mongoose.connection.on("connected", () => {
      console.log("connected to mongo database");
    });

    mongoose.connection.on("error", (err) => {
      console.log("Error at mongoDB: " + err);
    });
  } catch (e) {
    console.error(e);
  }
}


module.exports = {
  initDb
};
