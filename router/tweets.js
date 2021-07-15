const Router = require('express').Router;
const database = require('../database');

const tweetsRouter = Router();

// GET /tweets
tweetsRouter.get("/", async (req, res) => {
    const tweets = await database.getTweets();
    res.status(200).json(tweets);
});

// POST /tweets
tweetsRouter.post("/", async (req, res) => {
    if(!req.body.content || !req.body.username) {
        res.status(400).send("Invalid request, POST /tweets request has to include 'content' and 'username'");
        return;
    }

    const tweet = {
        content: req.body.content,
        username: req.body.username
    };

    if(await database.newTweet(tweet)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

// POST /tweets/:id/likes
tweetsRouter.post("/:id/likes", async (req, res) => {
    if(isNaN(req.params.id)) {
        // Invalid id
        res.send(400).send("Invalid tweet id");
        return;
    }
    
    const username = req.body.username;
    const tweetId = parseInt(req.params.id);

    if(!username) {
        res.status(400).send("Invalid request, POST /tweets/:id/retweet request has to include 'username'");
        return;
    }

    if(await database.likeTweet(tweetId, username)) {
        res.sendStatus(200);
    } else {
        res.status(400).send("Tweet not found");
    }
});

// POST /tweets/:id/retweet
tweetsRouter.post("/:id/retweet", async (req, res) => {
    if(isNaN(req.params.id)) {
        // Invalid id
        res.status(400).send("Invalid tweet id");
        return;
    }

    const username = req.body.username;
    const tweetId = parseInt(req.params.id);

    if(!username) {
        res.status(400).send("Invalid request, POST /tweets/:id/retweet request has to include 'username'");
        return;
    }

    if(await database.retweet(tweetId, username)) {
        res.sendStatus(200);
    } else {
        res.status(400).send("Tweet not found");
    }
});

module.exports = {
    tweetsRouter
};