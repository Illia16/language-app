const fs = require('fs');
const OpenAI = require("openai");
const config = require('../deploy.config');

// const baseSentence = "I have never been to France.";
// const baseSentence = "I like apples.";
const baseSentence = "Will you be there?";
// const baseSentence = "I didn't like that cake";
const outputFileName = 'results.txt';
const openai = new OpenAI({ apiKey: config.OPEN_AI_KEY });

async function main(prompt) {
  const completion = await openai.chat.completions.create({
    messages: [{ 
      role: "user", 
      content: `Given the sentence: "${prompt}", generate three grammatically incorrect sentences. The errors should vary in type, such as tense mismatches, incorrect verb forms, incorrect words or word order issues. Output only sentenses.`
    }],
    model: "gpt-4o-mini",
    max_tokens: 50,
    temperature: 1.0,
  });

  console.log('completion', completion.choices[0].message.content);
  const results = '\n \n \n' + `Base sentence: ${prompt}\n` + completion.choices[0].message.content;
  fs.appendFileSync(outputFileName, results);
  console.log(`Results have been written to ${outputFileName}. The results are: ${completion.choices[0].message.content}`);
  const arrRes = completion.choices[0].message.content.split('\n').map(sentence => sentence.replace(/^(\d+\.|\d+\))\s/, '').trim())
  console.log('arrRes', arrRes);
}

main(baseSentence);