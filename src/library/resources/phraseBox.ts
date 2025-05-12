const isProduction: boolean = true;
const ip: string = isProduction ? 'https://fae.deabakery.co.id' : 'http://localhost:';
const port: string = isProduction ? '' : '8080';
export const phraseBox = {
    url: `${ip}${port ? `:${port}` : ''}/api/v1/`,
    rawLink : `${ip}${port ? `:${port}` : ''}/`,
}