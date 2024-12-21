const fs = require('fs');
const OpenAI = require("openai");
const path = require('path');
const config = require('../../deploy.config');

const langMapping = {
  en: 'English',
  ru: 'Russian',
  es: 'Spanish',
  zh: 'Chineese'
}

const userData = {
  prompt: `I want to learn about modal verbs.`,
  languageStudying: 'en',
  userMotherTongue: 'ru',
  numberOfItems: 2
};

const openai = new OpenAI({ apiKey: config.OPEN_AI_KEY });

async function main(userData) {
  // Resolve it to a specific language learning category.
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: `Given the user input: "${userData.prompt}". Generate an object containing the results with ${userData.numberOfItems} different items. Each item must strictly adhere to this structure:
      {
        items: [
          {
            item: {{The topic or example related to ${userData.prompt} in ${langMapping[userData.languageStudying]}. Ensure it aligns as closely as possible with the user's input}},
            itemCorrect: {{The ${langMapping[userData.userMotherTongue]} translation of the "item" field. the same item as above translated to}},
            itemTranscription: {{The pronunciation transcription of the "item" in ${langMapping[userData.languageStudying]}}},
            itemType: {{Must be one of the following: "sentence", "word", "tenses", "collocation". Choose the type that best represents the "item"}},
            itemTypeCategory: {{determine the item category based on what "item" is}},
            incorrectItems: {{Generate three grammatically different incorrect examples based on the "item" field. Ensure these examples are as close as possible to the "item" in grammar, type, and structure, but still incorrect}},
          }
        ]
      }
      `
    }],
    model: "gpt-4o-mini",
    temperature: 0.1,
    response_format: {
      "type": "json_schema",
      "json_schema": {
        "name": "ai_data_based_on_input__response",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "items": {
              "type": "array",
              // "minItems": userData.numberOfItems, // not yet supported
              // "maxItems": userData.numberOfItems,
              "items": {
                "type": "object",
                "properties": {
                  "item": {
                    "type": "string",
                    "description": "The topic or example related to the user's prompt in the target language."
                  },
                  "itemCorrect": {
                    "type": "string",
                    "description": "The translation of 'item' into the user's native language."
                  },
                  "itemTranscription": {
                    "type": "string",
                    "description": "The pronunciation transcription of 'item' in the target language."
                  },
                  "itemType": {
                    "type": "string",
                    "enum": [
                      "sentence",
                      "word",
                      "tenses",
                      "collocation"
                    ],
                    "description": "The type of the item, selected from a predefined list."
                  },
                  "itemTypeCategory": {
                    "type": "string",
                    "description": "The category determined based on the 'item'."
                  },
                  "incorrectItems": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "description": "A grammatically incorrect example related to 'item'."
                    },
                    // "minItems": 3,
                    // "maxItems": 3,
                    "description": "An array of three grammatically incorrect examples."
                  }
                },
                "required": [
                  "item",
                  "itemCorrect",
                  "itemTranscription",
                  "itemType",
                  "itemTypeCategory",
                  "incorrectItems"
                ],
                "additionalProperties": false
              },
            }
          },
          "required": [
            "items",
          ],
          "additionalProperties": false
        }
      }
    },
  });

  console.log('completion', completion.choices[0].message.content, typeof completion.choices[0].message.content);
  const results = JSON.parse(completion.choices[0].message.content);

  const validate = (results, userData) => {
    const expectedKeys = [
      "item", 
      "itemCorrect", 
      "itemTranscription", 
      "itemType", 
      "itemTypeCategory", 
      "incorrectItems"
    ];
  
    // Individual checks
    const checks = {
      isArray: Array.isArray(results.items),
      hasCorrectLength: results.items?.length === userData.numberOfItems,
      allItemsHaveExpectedKeys: results.items?.every(
        item => Object.keys(item).length === expectedKeys.length &&
                expectedKeys.every(key => key in item && typeof item[key] !== "undefined")
      ) ?? false,
      allIncorrectItemsValid: results.items?.every(
        item => Array.isArray(item.incorrectItems) && item.incorrectItems.length === 3
      ) ?? false
    };
  
    // Overall validity
    const isValid = Object.values(checks).every(check => check);
  
    return {
      isValid,
      ...checks
    };
  }

  const validateRes = validate(results, userData);
  if (!validateRes.isValid) {
    console.log('validateRes', validateRes);
    throw new Error("Invalid response structure from AI...");
  }

  const outputFilePath = path.join(__dirname, 'test-openai-generate-entire-category--results.js');
  const now = new Date();
  const uniqueVarName = `resp_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  const newVarString = `export const ${uniqueVarName} = ${JSON.stringify(results, null, 2)};\n \n \n`;
  fs.appendFileSync(outputFilePath, newVarString);
}

main(userData);