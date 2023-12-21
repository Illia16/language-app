const OpenAI = require("openai");
const config = require('../config');
const openai = new OpenAI({ apiKey: config.openAiKey });

module.exports = {
    getIncorrectItems: async (prompt) => {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: `Given the sentence: ${prompt}. Give 3 incorrect similar sentences. Feel free to use other English tenses if needed.` }],
            // model: "text-davinci-003", soon will be deprecated
            model: "gpt-3.5-turbo",
            max_tokens: 40,
            temperature: 0.7,
          });
        
          console.log('completion', completion);
          const arrRes = completion.choices[0].message.content.split('\n').map(sentence => sentence.replace(/^(\d+\.|\d+\))\s/, '').trim())
          console.log('arrRes', arrRes);
          return arrRes;
    },
    getAudio: async (v) => {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "echo",
            input: v,
        });

        console.log('mp3', mp3);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        console.log('buffer', buffer);
        return buffer;
    },
}