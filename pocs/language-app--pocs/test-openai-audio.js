const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

const config = require('../../deploy.config');

const openai = new OpenAI({ apiKey: config.OPEN_AI_KEY });

const baseSentence = "The man needs help.";
const speechFile = path.resolve("./audio-generated/speech.mp3");

async function main(v) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "echo",
    input: v,
  });
  console.log('mp3', mp3);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  console.log('buffer', buffer);
  await fs.promises.writeFile(speechFile, buffer);
}
main(baseSentence);
