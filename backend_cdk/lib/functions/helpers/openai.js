const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

module.exports = {
    getIncorrectItems: async (prompt) => {
        const completion = await openai.chat.completions.create({
            messages: [{ 
                role: "user", 
                content: `Given the sentence: "${prompt}", generate three grammatically incorrect sentences. The errors should vary in type, such as tense mismatches, incorrect verb forms, incorrect words or word order issues. Output only sentenses.`
            }],
            model: "gpt-4o-mini",
            max_tokens: 50,
            temperature: 1.0,
          });
        
          const arrRes = completion.choices[0].message.content
            .split('\n')
            .map(sentence => sentence.replace(/^(\d+\.|\d+\))\s/, '').trim())
            .map(sentence => sentence.replace(/^["']|["']$/g, ''));
          return arrRes;
    },
    getAudio: async (v) => {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "echo",
            input: v,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        return buffer;
    },
}