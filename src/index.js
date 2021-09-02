//require('dotenv').config()
const express = require('express');
const { getData } = require('./twitterUtils.js');
const { getPredictions, loadModel } = require('./toxicityUtils.js');

const app = express();
const port = process.env.PORT || 3000;

let model;

async function main(twitterHandle, pagination) {
    let tweetArray = [];
    let finalArray = [];

    try {
        tweetArray = await getData(twitterHandle, pagination);

        if (typeof tweetArray === "string") {
            throw new Error(tweetArray);
        }

        for (const tweet of tweetArray) {
            let analyzedTweet = await getPredictions(tweet.text, model, tweet.id);
            finalArray.push(analyzedTweet);
        }

        return finalArray;
    }
    catch (e) {
        //console.log(e);
        return e.message;
    }

}


app.get('/search_tweets', async (req, res) => {
    //console.log("Loading Data........");
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    let requestQuery = req.query;
    let pagination = parseInt(requestQuery.pagination, 10);


    try {
        if (!(model)) {
            throw new Error("Model not loaded");
        }
        if (!(requestQuery.twitter_handle.match(/^[a-z0-9_]{4,15}$/i))) {
            throw new Error("Invalid Username");
        }

        let val = await main(requestQuery.twitter_handle, pagination);


        if (typeof val === "string") {
            throw new Error(val);
        }

        res.status(200);
        res.json(val);

    }
    catch (e) {
        res.status(400);
        res.json({ error: e.message });
    }
})

app.listen(port, async () => {
    //console.log("Loading model.............");
    model = await loadModel();
    //console.log(`Listening at port: ${port}`);
})


