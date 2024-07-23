import { callRequest } from "../../../library/utils/db";

export const load = async () => {
    let testee = [];

    testee = await callRequest('Clyfar/Dashboard');

    return {
        testee : testee
    };
}