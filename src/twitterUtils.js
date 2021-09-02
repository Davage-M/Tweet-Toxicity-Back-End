const Twitter = require('twitter-v2');


/*
const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET
});
*/

const client = new Twitter({
    bearer_token: process.env.BEARER_TOKEN
});

exports.getData = async function (userName, pagination) {
    let tweetFinalArray = [];
    let tweetData = {};
    let tentativeTweet = {};


    try {
        const { data: user } = await client.get(`users/by/username/${userName}`);


        if (!(user)) {
            throw new Error("User does not exist");
        }

        tweetData = await client.get(`users/${user.id}/tweets?tweet.fields=created_at&max_results=100`);



        if (!(tweetData.data)) {
            throw new Error("User has no tweets");
        }

        if (tweetData.errors) {
            throw new Error(tweetData.errors[0].title);
        }


        //Pagination -- Get next pages
        if (pagination) {

            let nextToken = tweetData.meta.next_token;
            if (nextToken) {
                do {

                    let nextTweetData = await client.get(`users/${user.id}/tweets?tweet.fields=created_at&max_results=100&pagination_token=${nextToken}`);

                    for (const tweet of nextTweetData.data) {

                        tweetData.data.push(tweet);
                    }
                    nextToken = nextTweetData.meta.next_token;
                } while (nextToken);

            }
        }




        for (const tweet of tweetData.data) {
            tentativeTweet.text = tweet.text;
            tentativeTweet.id = tweet.id;
            tweetFinalArray.push(tentativeTweet);
            tentativeTweet = {};
        }



        return tweetFinalArray;

    }
    catch (e) {

        return e.message;
    }

}

