const { Pool } = require('pg');

const pool = new Pool();

const tables = {
    tweets: "Tweets",
    likes: "Likes",
    retweets: "Retweets"
}

const tweetsColumns = {
    id: "id",
    content: "content",
    username: "username",
    timestamp: "timestamp"
}

const likesColumns = {
    post_id: "post_id",
    username: "username",
    timestamp: "timestamp"
}

const retweetsColumns = {
    post_id: "post_id",
    username: "username",
    timestamp: "timestamp"
}

async function createTables() {
    await Promise.all([pool.query(`
    CREATE TABLE IF NOT EXISTS ${tables.tweets} (
        ${tweetsColumns.id} SERIAL PRIMARY KEY,
        ${tweetsColumns.content} VARCHAR(65535) NOT NULL,
        ${tweetsColumns.username} VARCHAR(50) NOT NULL,
        ${tweetsColumns.timestamp} TIMESTAMP NOT NULL
     );
    `),
    pool.query(`
    CREATE TABLE IF NOT EXISTS ${tables.likes} (
        ${likesColumns.post_id} INT NOT NULL,
        ${likesColumns.username} VARCHAR(50) NOT NULL,
        ${likesColumns.timestamp} TIMESTAMP NOT NULL
     );
    `),
    pool.query(`
    CREATE TABLE IF NOT EXISTS ${tables.retweets} (
        ${retweetsColumns.post_id} INT NOT NULL,
        ${retweetsColumns.username} VARCHAR(50) NOT NULL,
        ${retweetsColumns.timestamp} TIMESTAMP NOT NULL
     );
    `)]);
}


const queries = {
    getAllTweets: `
        SELECT * FROM ${tables.tweets}`,
    getAllRetweets: `
        SELECT * FROM ${tables.retweets}`,
    getAllLikes: `
        SELECT * FROM ${tables.likes}`,
    getTweet: `
            SELECT * FROM ${tables.tweets}
            WHERE id = $1`,
    newTweet: `
        INSERT INTO ${tables.tweets}(
            ${tweetsColumns.content},
            ${tweetsColumns.username},
            ${tweetsColumns.timestamp}
        ) VALUES (
            $1,
            $2,
            current_timestamp
        )`,
    getLikeByUser: `
        SELECT ${likesColumns.post_id} FROM ${tables.likes}
        WHERE ${likesColumns.post_id} = $1 AND ${likesColumns.username} = $2`,
    getLikeByPost: `
        SELECT ${likesColumns.post_id} FROM ${tables.likes}
        WHERE ${likesColumns.post_id} = $1`,
    getRetweetByUser: `
        SELECT ${retweetsColumns.post_id} FROM ${tables.retweets}
        WHERE ${retweetsColumns.post_id} = $1 AND ${retweetsColumns.username} = $2`,
    getRetweetByPost: `
        SELECT ${retweetsColumns.post_id} FROM ${tables.retweets}
        WHERE ${retweetsColumns.post_id} = $1`,
    removeLike: `
        DELETE FROM ${tables.likes}
        WHERE ${likesColumns.post_id} = $1 AND ${likesColumns.username} = $2`,
    addLike: `
        INSERT INTO ${tables.likes}(
            ${likesColumns.post_id},
            ${likesColumns.username},
            ${likesColumns.timestamp}
        ) VALUES (
            $1,
            $2,
            current_timestamp
        )
    `,
    getRetweet: `
        SELECT ${retweetsColumns.post_id} FROM ${tables.retweets}
        WHERE ${retweetsColumns.post_id} = $1 AND ${retweetsColumns.username} = $2`,
    removeRetweet: `
        DELETE FROM ${tables.retweets}
        WHERE ${retweetsColumns.post_id} = $1 AND ${retweetsColumns.username} = $2`,
    addRetweet: `
        INSERT INTO ${tables.retweets}(
            ${retweetsColumns.post_id},
            ${retweetsColumns.username},
            ${retweetsColumns.timestamp}
        ) VALUES (
            $1,
            $2,
            current_timestamp
        )`

}

async function getTweets() {
    try {
        const tweets = await Promise.all((await pool.query(queries.getAllTweets)).rows.map(async (row) => {
            const likes_count = (await pool.query(queries.getLikeByPost, [row.id])).rowCount;
            const retweets_count = (await pool.query(queries.getRetweetByPost, [row.id])).rowCount;
            return {
                ...row,
                likes_count,
                retweets_count
            };
        }));
        console.log(tweets);
        return tweets;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function getRetweets() {
    try {
        return (await pool.query(queries.getAllRetweets)).rows;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function newTweet(tweet) {
    try {
        await pool.query(queries.newTweet, [tweet.content, tweet.username]);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function likeTweet(tweetId, username) {
    if(!await _findTweet(tweetId)) {
        return false;
    }
    try {
        const isLiked = (await pool.query(queries.getLikeByUser, [tweetId, username])).rowCount > 0;
        await pool.query(isLiked ? queries.removeLike : queries.addLike, [tweetId, username]);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function retweet(tweetId, username) {
    if(!await _findTweet(tweetId)) {
        return false;
    }
    try {
        const isRetweet = (await pool.query(queries.getRetweetByUser, [tweetId, username])).rowCount > 0;
        await pool.query(isRetweet ? queries.removeRetweet : queries.addRetweet, [tweetId, username]);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function _findTweet(tweetId) {
    try {
        return (await pool.query(queries.getTweet, [tweetId])).rowCount > 0;
    } catch (e) {
        console.error(e);
        return false
    }
}

async function verify() {
    const tweets = await pool.query(queries.getAllTweets);
    const likes = await pool.query(queries.getAllLikes);
    const retweets = await pool.query(queries.getAllRetweets);
    return true;
}

module.exports = {
    getTweets,
    getRetweets,
    likeTweet,
    newTweet,
    retweet,
    verify,
    createTables
}