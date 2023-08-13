const MongoClient = require('mongodb').MongoClient;
const { ServerApiVersion } = require('mongodb');
const fs = require('fs');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const toWav = require('audiobuffer-to-wav');
const { decode } = require('wav-decoder');

const mongodbURI = encodeURI(sessionStorage.getItem('mongoForm'));
const mongodbClient = new MongoClient(mongodbURI, { serverApi: { version: ServerApiVersion.v1, useNewUrlParser: true, useUnifiedTopology: true } });

const AzureSubscriptionKey = sessionStorage.getItem('azurePassword');
const AzureRegion = sessionStorage.getItem('azureLocation');
const AzureSpeechConfig = sdk.SpeechConfig.fromSubscription(AzureSubscriptionKey, AzureRegion);

let audioLengthInSeconds = 0;
let audioProgressInterval = null;
let currentTime = 0;
let displayAnswer = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let question = await getOneQuestion();
        if (question.acknowledged) {
            document.querySelector("#displayAnswer").value = question.data.questionText
            document.querySelector("#inputQuestionid").value = question.data.questionId
            synthesizeSpeech(question.data.questionText);
        }
    } catch (err) {
        console.error(err)
    }
});

document.querySelector("#btnGo").addEventListener("click",async ()=>{
    const sessions = mongodbClient.db("ptepractice").collection("listening");
    const findingQuery = {questionId:document.querySelector("#inputQuestionid").value}
    try {
        await mongodbClient.connect();
        if ((await sessions.countDocuments(findingQuery)) === 0) {
            document.querySelector("#inputQuestionid").value = "Question Not Found";
        } else {
            const currentURL = new URL(window.location.href);
            currentURL.searchParams.set('q', document.querySelector("#inputQuestionid").value);
            window.location.href = currentURL.toString();
        }
    } catch (error) {
        console.error(error)
    }
})

document.querySelector("#btnAnswer").addEventListener("click",()=>{
    if (displayAnswer) {
        displayAnswer = !displayAnswer
        document.querySelector("#displayAnswer").style.setProperty("display","none")
    } else {
        displayAnswer = !displayAnswer
        document.querySelector("#displayAnswer").style.removeProperty("display")
    }
})

function startProgressBar() {
    if (audioProgressInterval) {
        document.querySelector("#labelPlayStatustext").innerText = "Stopped"
        clearInterval(audioProgressInterval);
    }
    currentTime = 0;
    audioProgressInterval = setInterval(() => {
        document.querySelector("#labelPlayStatustext").innerText = "Playing"
        if (currentTime >= Math.ceil(audioLengthInSeconds*2)) {
            document.querySelector("#labelPlayStatustext").innerText = "Stopped"
            clearInterval(audioProgressInterval);
            return;
        }
        currentTime++;
        document.querySelector("#labelPlayProgress").max = Math.ceil(audioLengthInSeconds*2)
        document.querySelector("#labelPlayProgress").value = currentTime;
    }, 500);
}

async function getOneQuestion() {
    const sessions = mongodbClient.db("ptepractice").collection("listening");
    let returnResult = { acknowledged: false, data: null }
    let questions = []
    let filter = {questionCategory:"WFD"}
    const qid = new URL(window.location.href).searchParams.get('q');
    if (qid !== null) {
        filter = {questionId: qid}
    }
    console.log(filter)
    try {
        await mongodbClient.connect();
        let cursor = sessions.find(filter);
        for await (const x of cursor) {
            console.log(x)
            questions.push(x);
        }
        if (questions.length > 1) {
            returnResult.acknowledged = true
            returnResult.data = questions[Math.floor(Math.random() * questions.length)]
        } else if (questions.length > 0) {
            returnResult.acknowledged = true
            returnResult.data = questions[0]
        }
    } catch (err) {
        console.error("MongoDB Error:", err)
    }
    console.log(returnResult)
    return returnResult
}

document.getElementById('inputVoicerange').addEventListener('input', () => {
    document.getElementById('audioPlayer').volume = volumeRange.value;
});


function synthesizeSpeech(text) {
    let audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    let speechVoice = ["en-US-AriaNeural","en-US-DavisNeural","en-US-AmberNeural","en-US-JennyNeural","en-GB-LibbyNeural","en-US-BrandonNeural","en-US-GuyNeural","en-AU-DuncanNeural","en-AU-WilliamNeural","en-AU-NatashaNeural","en-GB-RyanNeural","en-GB-EthanNeural","en-GB-AlfieNeural","en-AU-AnnetteNeural","en-AU-CarlyNeural","en-AU-DarrenNeural","en-AU-ElsieNeural","en-AU-FreyaNeural","en-AU-TinaNeural"]
    let randomSelectedVoice = speechVoice[Math.floor(Math.random() * speechVoice.length)]
    console.log(`Using voice with ${randomSelectedVoice}`)
    AzureSpeechConfig.speechSynthesisVoiceName = randomSelectedVoice; 
    let synthesizer = new sdk.SpeechSynthesizer(AzureSpeechConfig, audioConfig);

    synthesizer.speakTextAsync(
        text,
        async result => {
            if (result) {
                // await computeDuration(result.audioData);
                audioLengthInSeconds = result.audioDuration / 10000000;// Convert 100-nanoseconds units to seconds
                console.log(`Audio Duration: ${result.audioDuration / 10000000}`);
                startProgressBar();
            }
            synthesizer.close();
        },
        error => {
            console.log(`Error: ${error}`);
            synthesizer.close();
        }
    );
}