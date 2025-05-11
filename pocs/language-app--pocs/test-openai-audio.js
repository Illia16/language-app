const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

const config = require('../../deploy.config');
const openai = new OpenAI({ apiKey: config.OPEN_AI_KEY });

// Get command-line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node script.js '<baseSentence>' '<instructions>'");
  process.exit(1);
}
const baseSentence = args[0];
const instructions = args[1];

console.log('instructions', instructions);
console.log('baseSentence', baseSentence);

const safeFilename = baseSentence
  .toLowerCase()
  .replace(/[^\w\s]/g, '')
  .split(/\s+/)
  .slice(0, 5)
  .join('-')
  .substring(0, 50);

const speechFile = path.resolve(`./audio-generated/speech--${safeFilename}.mp3`);
console.log('speechFile',speechFile);

async function main(v, instructions) {
  const mp3 = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "echo",
    input: v,
    instructions: instructions,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  console.log(`Audio saved to ${speechFile}`);
}

main(baseSentence, instructions);
