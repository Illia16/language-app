const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const clientSQS = new SQSClient({});

module.exports = {
    sendToQueue: async (data, eventName) => {
        const inputSQS = {
            QueueUrl: process.env.SQS_URL, // the project has 1 queue
            MessageBody: JSON.stringify({
                eventName: eventName, 
                data: data,
            }),
        };
        const commandSQS = new SendMessageCommand(inputSQS);
        await clientSQS.send(commandSQS);
    },
}