import { numberRandomizer } from "$lib/utils/randomizer";
import { currently } from "../database/base"

export const load = async ({fetch}) => {

    const loadJokes = await fetch('/src/database/json/jokes.json');
    const parser = await loadJokes.json();

    return {
        name : currently.name,
        position : currently.workingAt.position,
        workingAt : currently.workingAt.name,
        jokes : parser[numberRandomizer(0,parser.length)]
    }
}