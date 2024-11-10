import { db } from '../../../../library/utils/db.js'

export const load = async ({fetch, params}) => {
    let testResult: any = [];

    const {status, message, data} = await db({
        id : params.id
    }, 'Clyfar/View-Result');

    if (status === 'success') {
        testResult = data;
    }

    return {
        result : testResult
    }
}