const mongoose = require('mongoose');

const InitializeDatabaseConnection = () => {
    const uri = "mongodb://localhost:27017/chatApp?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false";
    try {
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        mongoose.connection.on('connected', () => {
            console.log('connected to mongo database');
        });
        mongoose.connection.on('error', err => {
            console.log('Error at mongoDB: ' + err);
        });
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    InitializeDatabaseConnection
}