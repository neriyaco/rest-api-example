const Router = require('express').Router;
const database = require('../database');

const retweetsRouter = Router();

// GET /retweets
retweetsRouter.get("/", async (req, res) => {
    const retweets = await database.getRetweets();
    res.status(200).json(retweets);
});

module.exports = {
    retweetsRouter
};          