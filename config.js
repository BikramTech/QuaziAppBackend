const Https = require('https');

const { UserApiRoutes } = require('./src/modules');

const DbConnectionService = require('./src/services/dbConnectionService')

const InitializeServer = (app, port) => {
    Https.createServer(null, app).listen(port, () => {
        console.log(`server listening on port ${port}!`);

        DbConnectionService.InitializeDatabaseConnection();
    });
}

const InitializeApiRoutes = (app) => {
    
    app.use("/Users", UserApiRoutes);

}

module.exports = {
    InitializeServer,
    InitializeApiRoutes
}