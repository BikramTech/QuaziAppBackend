const express = require('express');
const router = express.Router();

router.get('/GetUsers', async (req, res) => {

    console.log("Get Users Api Called!");

});

module.exports = router;