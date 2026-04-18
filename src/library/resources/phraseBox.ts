const isProduction: boolean = false;
const ip: string = isProduction ? 'https://fae.deabakery.co.id' : 'http://localhost';
const port: string = isProduction ? '' : '8000';
export const phraseBox = {
    url: `${ip}${port ? `:${port}` : ''}/api/`,
    rawLink: `${ip}${port ? `:${port}` : ''}/`,
}
