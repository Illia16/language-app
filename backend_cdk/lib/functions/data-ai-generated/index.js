const { responseWithError, getSecret, findUser, saveBatchItems } = require('../helpers');
const { getAIDataBasedOnUserInput } = require('../helpers/openai')
const jwt = require('jsonwebtoken');

module.exports.handler = async (event) => {
    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const SQS_URL = process.env.SQS_URL; // for ref
    const secretJwt = await getSecret(`${PROJECT_NAME}--secret-auth--${STAGE}`);
    const dbData = process.env.DB_DATA;
    const dbUsers = process.env.DB_USERS;
    const s3Files = process.env.S3_FILES;

    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.CLOUDFRONT_URL];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const action = event.httpMethod;

    // Handle data
    const payload = JSON.parse(event.body);
    let user = '';
    let userTierPremium = false;

    // Response obj
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": headerOrigin,
        },
        body: null,
    };

    // Check if token is valid
    const authToken = headers['authorization'] || headers['Authorization'];
    if (!authToken) {
        return responseWithError('401', 'No token provided.', headerOrigin)
    }
    const token = authToken.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretJwt);
        user = decoded.user;
    } catch (error) {
        return responseWithError('401', `Failed to validate token. ${error}`, headerOrigin)
    }
    // 

    if (action === 'POST') {
        if (!payload.prompt || payload.prompt.length > 100 || !payload.userMotherTongue || !payload.languageStudying || !payload.numberOfItems || Number(payload.numberOfItems) > 20) {
            return responseWithError('401', `Payload is invalid.`, headerOrigin)
        }

        // fetch user premiumStatus
        try {
            const userInfo = await findUser(dbUsers, user);
            userTierPremium = userInfo[0].userTier === 'premium';
        } catch (error) {
            return responseWithError('401', `Failed to fetch user premiumStatus. ${error}`, headerOrigin)
        }
        //

        let resultsAIdata;
        try {
            resultsAIdata = await getAIDataBasedOnUserInput({
                prompt: payload.prompt,
                userMotherTongue: payload.userMotherTongue,
                languageStudying: payload.languageStudying,
                numberOfItems: payload.numberOfItems,
                user: user,
                userTierPremium: userTierPremium,
            })
            console.log('resultsAIdata', resultsAIdata);
        } catch (error) {
            return responseWithError('401', `Failed to get AI data. ${error}`, headerOrigin)
        }

        try {
            const allEls = await saveBatchItems(
                resultsAIdata.items,
                userTierPremium,
                user,
                payload.userMotherTongue,
                payload.languageStudying,
            );
            response.body = JSON.stringify({success: true, data: allEls});
        } catch (error) {
            return responseWithError('500', `Failed to post AI data. ${error}`, headerOrigin);
        }
    }

    return response;
};
