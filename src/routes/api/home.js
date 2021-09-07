const router = require("express").Router();

router.get("/", function (req, res) {
  res.json("api working");
});

module.exports = router;
