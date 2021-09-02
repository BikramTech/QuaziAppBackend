const express = require('express');
const app = express();
const cors = require('cors');

const { InitializeServer, InitializeApiRoutes } = require('./config');

const PORT =  8004;


app.use(cors())

InitializeApiRoutes(app);

InitializeServer(app, PORT);