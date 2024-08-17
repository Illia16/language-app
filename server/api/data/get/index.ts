export default defineEventHandler(async (event) => {
    console.log('be API_URL_DATA:', process.env.API_URL_DATA,);
    console.log('be ENV_NAME:', process.env.ENV_NAME,);

    const query = getQuery(event);
    const res = await fetch(`${process.env.API_URL_DATA}/${process.env.ENV_NAME}/data?user=${query.user}`)
    .then(res => res.json());
    console.log('res', res);
    return res;
})
