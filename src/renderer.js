const MongoClient = require('mongodb').MongoClient;
const { ipcRenderer } = require('electron');
const bootstrap = require('bootstrap')
const sdk = require('microsoft-cognitiveservices-speech-sdk');

// Saving Mongo Form to session
const mongoFormButton = document.querySelector('#mongoFormBtn');
const mongoFormInput = document.querySelector("#mongoURI");

document.addEventListener('DOMContentLoaded', async () => {
    try {
		mongoFormInput.value = sessionStorage.getItem('mongoForm') ? sessionStorage.getItem('mongoForm') : "";
		speechPasswordInput.value = sessionStorage.getItem('azurePassword') ?  sessionStorage.getItem('azurePassword') : "";
		speechLocationInput.value = sessionStorage.getItem('azureLocation') ? sessionStorage.getItem('azureLocation') : "";
    } catch (err) {
        console.error(err)
    }
});

mongoFormButton.addEventListener("click", (ev) => {
	ev.preventDefault()
	// Check if MongoUI is valid
	const regex = /^mongodb(?:\+srv)?:\/\/(?:(\w+):(\w+)@)?(?:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}|xxx\.local|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[[0-9a-fA-F:]+\])/;
	if (mongoFormInput.value.match(regex)) { // match with valid ip
		checkMongoConnection(mongoFormInput.value).then(success => {
			if (success) {
				sessionStorage.setItem("mongoForm", mongoFormInput.value)
				document.querySelector("#mongoFormStatus").innerHTML = "Status: Success"
			} else {
				document.querySelector("#mongoFormStatus").innerHTML = "Status: Failed ; Connection Failed"
			}
		})
	} else {
		document.querySelector("#mongoFormStatus").innerHTML = "Status: Failed ; URI String format incorrect"
	}
})


async function checkMongoConnection(uri) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	try {
		await client.connect();
		console.log("MongoDB: Connection Success. ");
		return true;
	} catch (error) {
		console.error("MongoDB: Connection Failed. ", error.message);
		return false;
	} finally {
		await client.close();
	}
}

// Saving Azure Form to session
const speechPasswordInput = document.querySelector("#speechPassword")
const speechLocationInput = document.querySelector("#speechLocation")
const azureStatusText = document.querySelector("#azureStatusText")
const azureFormSubmitButton = document.querySelector("#azureFormSubmitBtn")
azureFormSubmitButton.addEventListener("click",(ev)=>{
	ev.preventDefault()
	try {
		// Testing for connection 
		let AzureSpeechConfig = sdk.SpeechConfig.fromSubscription(speechPasswordInput.value, speechLocationInput.value);
		let result = synthesizeSpeech("Voice system enabled.", AzureSpeechConfig);
		console.log(result)
		sessionStorage.setItem("azurePassword",speechPasswordInput.value)
		sessionStorage.setItem("azureLocation",speechLocationInput.value)
	} catch (error) {
		console.error(error)
	}
	
	
})

function synthesizeSpeech(text, AzureSpeechConfig) {
    let audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    let randomSelectedVoice = "en-US-AriaNeural"
    AzureSpeechConfig.speechSynthesisVoiceName = randomSelectedVoice; 
    let synthesizer = new sdk.SpeechSynthesizer(AzureSpeechConfig, audioConfig);

    synthesizer.speakTextAsync(
        text,
        async result => {
            if (result) {
                azureStatusText.innerHTML = "Status: Success"
            }
            synthesizer.close();
        },
        error => {
            console.error(`Error: ${error}`);
			azureStatusText.innerHTML = "Status: Failed"
            synthesizer.close();
        }
    );
}