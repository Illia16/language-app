const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const { sendToQueue } = require('./aws');

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
    langMapping: {
        en: 'English',
        ru: 'Russian',
        zh: 'Chineese',
        es: 'Spanish',
    },
    getAIDataBasedOnUserInput: async (data) => {
        // Resolve it to a specific language learning category.
        const completion = await openai.chat.completions.create({
            messages: [{ 
            role: "user", 
            content: `Given the user input: "${data.prompt}". Generate an array containing up to ${data.numberOfItems} items. Each item must strictly adhere to this structure:
            [
                {
                    item: {{The topic or example related to ${data.prompt} in ${module.exports.langMapping[data.languageStudying]}. Ensure it aligns as closely as possible with the user's input}},
                    itemCorrect: {{The ${module.exports.langMapping[data.userMotherTongue]} translation of the "item" field. the same item as above translated to}},
                    itemTranscription: {{The pronunciation transcription of the "item" in ${module.exports.langMapping[data.languageStudying]}}},
                    itemType: {{Must be one of the following: "sentence", "word", "tenses", "collocation". Choose the type that best represents the "item"}},
                    itemTypeCategory: {{determine the item category based on what "item is}},
                    incorrectItems: {{Generate three grammatically incorrect examples based on the "item" field. Ensure these examples are as close as possible to the "item" in grammar, type, and structure, but still incorrect}},
                }
            ]

            Do not include periods at the end.
            Output a valid JSON only. 
            `
            }],
            model: "gpt-4o-mini",
            temperature: 0.2,
        });

        console.log('completion', completion.choices[0].message.content);
        const cleanedResponse = JSON.parse(completion.choices[0].message.content
            .replace(/^```(json|javascript)?\s*/g, '')
            .replace(/\s*```$/g, '')
            .trim());
        // for debugging
        // const cleanedResponse = [
        //     {
        //       "item": "can",
        //       "itemCorrect": "мочь",
        //       "itemTranscription": "/kæn/",
        //       "itemType": "word",
        //       "itemTypeCategory": "modal verb",
        //       "incorrectItems": [
        //         "cans",
        //         "caned",
        //         "caning"
        //       ],
        //       fakeKey1: 1,
        //     },
        //     {
        //       "item": "She can swim",
        //       "itemCorrect": "Она может плавать",
        //       "itemTranscription": "/ʃi kæn swɪm/",
        //       "itemType": "sentence",
        //       "itemTypeCategory": "modal verb usage",
        //       "incorrectItems": [
        //         "She can swims",
        //         "She cans swim",
        //         "She can swimmed"
        //       ],
        //       fakeKey2: 1,
        //     }
        // ];

        if (!module.exports.isAiDataValid(cleanedResponse)) {
            // if data failed to be of a required shape, move to SQS, then redrive if needed.
            await sendToQueue({
                failedData: cleanedResponse,
                userData: {
                    user: data.user,
                    userTierPremium: data.userTierPremium,
                    userMotherTongue: data.userMotherTongue,
                    languageStudying: data.languageStudying,
                }
            }, 'parse-ai-data');
            throw new Error("Invalid response structure from AI");
        }

        return cleanedResponse;
    },
    isAiDataValid: (cleanedResponse) => {
        // Define the expected keys
        const expectedKeys = ["item", "itemCorrect", "itemTranscription", "itemType", "itemTypeCategory", "incorrectItems"];
        // TODO: force AI to give cleanedResponse.length === data.numberOfItems
        const isValid = Array.isArray(cleanedResponse) && cleanedResponse.every(item =>
            Object.keys(item).length === expectedKeys.length &&
            expectedKeys.every(key => key in item && typeof item[key] !== "undefined") &&
            Array.isArray(item.incorrectItems) && item.incorrectItems.length === 3
        );

        return isValid;
    },
}