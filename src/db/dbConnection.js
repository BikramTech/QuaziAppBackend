const mongoose = require("mongoose");
const { db } = require("../config/appConfig");

const getConnectionString = () => {
  return "mongodb://qz_dev_user:dev402020@52.14.156.178:61099/Quazi"
}

const initDb = () => {
  const connectionString = getConnectionString();
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
