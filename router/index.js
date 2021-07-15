const Router = require('express').Router;
const { tweetsRouter } = require("./tweets");
const { retweetsRouter } = require("./retweets");


const router = Router();

router.use("/tweets", tweetsRouter);
router.use("/retweets", retweetsRouter);

module.exports = router;
