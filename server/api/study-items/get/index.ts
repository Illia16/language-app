export default defineEventHandler(async (event) => {
    console.log('be apiUrl:', process.env.API_URL,);
    console.log('be apiKey:', process.env.API_KEY,);
    console.log('be envName:', process.env.ENV_NAME,);
    
    const query = getQuery(event);
    const res = await fetch(`${process.env.API_URL}/${process.env.ENV_NAME}/study-items?user=${query.user}`)
    .then(res => res.json());
    console.log('res', res);
    return res;
})