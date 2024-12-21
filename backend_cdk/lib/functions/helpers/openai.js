const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const { sendToQueue } = require("./aws");

module.exports = {
    getIncorrectItems: async (prompt) => {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Given the sentence: "${prompt}", generate three grammatically incorrect sentences. The errors should vary in type, such as tense mismatches, incorrect verb forms, incorrect words or word order issues. Output only sentenses.`,
                },
            ],
            model: "gpt-4o-mini",
            max_tokens: 50,
            temperature: 1.0,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "ai_incorrect_items_response",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            incorrectItems: {
                                type: "array",
                                items: {
                                    type: "string",
                                    description:
                                        "A grammatically incorrect example related to prompt",
                                },
                                description:
                                    "An array of three grammatically incorrect examples",
                            },
                        },
                        required: ["incorrectItems"],
                        additionalProperties: false,
                    },
                },
            },
        });

        const results = JSON.parse(completion.choices[0].message.content)
        return results.incorrectItems;
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
        en: "English",
        ru: "Russian",
        zh: "Chineese",
        es: "Spanish",
    },
    getAIDataBasedOnUserInput: async (userData) => {
        // Resolve it to a specific language learning category.
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Given the user input: "${userData.prompt}". Generate an object containing the results with ${userData.numberOfItems} different items. Each item must strictly adhere to this structure:
                    {
                        items: [
                            {
                                item: {{The topic or example related to ${userData.prompt} in ${module.exports.langMapping[userData.languageStudying]}. Ensure it aligns as closely as possible with the user's input}},
                                itemCorrect: {{The ${module.exports.langMapping[userData.userMotherTongue]} translation of the "item" field. the same item as above translated to}},
                                itemTranscription: {{The pronunciation transcription of the "item" in ${module.exports.langMapping[userData.languageStudying]}}},
                                itemType: {{Must be one of the following: "sentence", "word", "tenses", "collocation". Choose the type that best represents the "item"}},
                                itemTypeCategory: {{determine the item category based on what "item" is}},
                                incorrectItems: {{Generate three grammatically different incorrect examples based on the "item" field. Ensure these examples are as close as possible to the "item" in grammar, type, and structure, but still incorrect}},
                            }
                        ]
                    }`,
                },
            ],
            model: "gpt-4o-mini",
            temperature: 0.1,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "ai_data_based_on_input__response",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            items: {
                                type: "array",
                                // "minItems": userData.numberOfItems, // not yet supported
                                // "maxItems": userData.numberOfItems,
                                items: {
                                    type: "object",
                                    properties: {
                                        item: {
                                            type: "string",
                                            description:
                                                "The topic or example related to the user's prompt in the target language.",
                                        },
                                        itemCorrect: {
                                            type: "string",
                                            description:
                                                "The translation of 'item' into the user's native language.",
                                        },
                                        itemTranscription: {
                                            type: "string",
                                            description:
                                                "The pronunciation transcription of 'item' in the target language.",
                                        },
                                        itemType: {
                                            type: "string",
                                            enum: [
                                                "sentence",
                                                "word",
                                                "tenses",
                                                "collocation",
                                            ],
                                            description:
                                                "The type of the item, selected from a predefined list.",
                                        },
                                        itemTypeCategory: {
                                            type: "string",
                                            description:
                                                "The category determined based on the 'item'.",
                                        },
                                        incorrectItems: {
                                            type: "array",
                                            items: {
                                                type: "string",
                                                description:
                                                    "A grammatically incorrect example related to 'item'.",
                                            },
                                            // "minItems": 3,
                                            // "maxItems": 3,
                                            description:
                                                "An array of three grammatically incorrect examples.",
                                        },
                                    },
                                    required: [
                                        "item",
                                        "itemCorrect",
                                        "itemTranscription",
                                        "itemType",
                                        "itemTypeCategory",
                                        "incorrectItems",
                                    ],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ["items"],
                        additionalProperties: false,
                    },
                },
            },
        });

        console.log(
            "completion",
            completion.choices[0].message.content,
            typeof completion.choices[0].message.content
        );
        const results = JSON.parse(completion.choices[0].message.content);
        // for debugging
        // const results = [
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

        if (!module.exports.isAiDataValid(results, userData).isValid) {
            // if results failed to be of a required shape, move to SQS, then redrive if needed.
            await sendToQueue(
                {
                    aiData: results,
                    userData: {
                        prompt: userData.prompt,
                        userMotherTongue: userData.userMotherTongue,
                        languageStudying: userData.languageStudying,
                        numberOfItems: userData.numberOfItems,
                        user: userData.user,
                        userTierPremium: userData.userTierPremium,
                    },
                },
                "parse-ai-data"
            );
            throw new Error(
                "Invalid response structure from AI. Your data will be processed manually."
            );
        }

        return results;
    },
    isAiDataValid: (results, userData) => {
        const expectedKeys = [
            "item",
            "itemCorrect",
            "itemTranscription",
            "itemType",
            "itemTypeCategory",
            "incorrectItems",
        ];

        // Individual checks
        const checks = {
            isArray: Array.isArray(results.items),
            hasCorrectLength: results.items?.length === userData.numberOfItems,
            allItemsHaveExpectedKeys:
                results.items?.every(
                    (item) =>
                        Object.keys(item).length === expectedKeys.length &&
                        expectedKeys.every(
                            (key) =>
                                key in item && typeof item[key] !== "undefined"
                        )
                ) ?? false,
            allIncorrectItemsValid:
                results.items?.every(
                    (item) =>
                        Array.isArray(item.incorrectItems) &&
                        item.incorrectItems.length === 3
                ) ?? false,
        };

        // Overall validity
        const isValid = Object.values(checks).every((check) => check);

        return {
            isValid,
            ...checks,
        };
    },
};
