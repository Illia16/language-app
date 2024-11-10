export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const res = await fetch(`${process.env.API_URL_DATA}/${process.env.ENV_NAME}/data?user=${query.user}`)
    .then(res => res.json());
    return res;
})
