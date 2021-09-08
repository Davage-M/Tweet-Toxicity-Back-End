require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity')

exports.getPredictions = async function (toBeEval, model, id) {
    let predictionObject = {};

    predictionObject.text = toBeEval;
    predictionObject.id = id;
    //let model = await toxicity.load(threshold);

    let predictions = await model.classify(toBeEval);

    parsePrediction(predictions, predictionObject);
    return predictionObject
}

exports.loadModel = async function () {
    const threshold = 0.85;
    let model = await toxicity.load(threshold);

    return model;
}

function parsePrediction(predictions, predictionObj) {
    predictionObj.label = {};

    for (const prediction of predictions) {
        let name = prediction.label;
        predictionObj.label[name] = prediction.results[0].match;
    }

}