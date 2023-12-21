const fs = require('fs');
const OpenAI = require("openai");
const config = require('../deploy.config');

// const baseSentence = "I have never been to France.";
// const baseSentence = "I like apples.";
const baseSentence = "I didn't like that cake.";
const outputFileName = 'results.txt';
const openai = new OpenAI({ apiKey: config.openAiKey });

async function main(prompt) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `Given the sentence: ${prompt}. Give 3 incorrect similar sentences. Feel free to use other English tenses if needed.` }],
    // model: "text-davinci-003", soon will be deprecated
    model: "gpt-3.5-turbo",
    max_tokens: 40,
    temperature: 0.7,
  });

  console.log('completion', completion);
  const results = '\n \n \n' + `Base sentence: ${prompt}\n` + completion.choices[0].message.content;
  fs.appendFileSync(outputFileName, results);
  console.log(`Results have been written to ${outputFileName}. The results are: ${completion.choices[0].message.content}`);
  const arrRes = completion.choices[0].message.content.split('\n').map(sentence => sentence.replace(/^(\d+\.|\d+\))\s/, '').trim())
  console.log('arrRes', arrRes);
}

main(baseSentence);