export async function load ({fetch, params}){
    const surahResponse = await fetch(`/fatiha/surah/${params.id}.json`);
    const surahData = await surahResponse.json();

    const chapterName = surahData[params.id].name_latin;
    const chapterTexts = surahData[params.id].text;
    const chapterTranslations = surahData[params.id].translations.id.text;

    let chapterContents = [];

    for (let i = 0; i < Object.values(chapterTexts).length; i++) {
        const verse = {
            arabic: chapterTexts[i + 1],
            transliteration: chapterTranslations[i + 1]
        };

        chapterContents.push(verse);
    }

    return {
        pageChapter: params.id,
        pageTitle: chapterName,
        chapterContents: chapterContents
    };
};