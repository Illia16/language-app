const fs = require('fs');
const OpenAI = require("openai");
const config = require('../../deploy.config');

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
    response_format: {
      "type": "json_schema",
      "json_schema": {
        "name": "ai_incorrect_items_response",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "incorrectItems": {
              "type": "array",
              "items": {
                "type": "string",
                "description": "A grammatically incorrect example related to prompt"
              },
              "description": "An array of three grammatically incorrect examples"
            }
          },
          "required": [
            "incorrectItems",
          ],
          "additionalProperties": false
        }
        // arrays not yet supported?
        // "schema": {
        //   "type": "array",
        //   "items": { "type": "string" }
        // }      
      }
    }
  });

  console.log('completion', completion.choices[0].message.content);
  const results = JSON.parse(completion.choices[0].message.content)
  console.log('results', results);
  fs.appendFileSync(outputFileName, '\n \n \n' + `Base sentence: ${prompt}\n` + results.incorrectItems);
}

main(baseSentence);