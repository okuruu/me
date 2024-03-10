export function formatTextIntoParagraphs(text: string): string {
    // Split the text into an array of sentences
    const sentences = text.split(/[.!?]/);

    // Initialize an empty array to store formatted paragraphs
    const paragraphs: string[] = [];

    // Iterate over the sentences array
    for (let i = 0; i < sentences.length; i++) {
        // Append each sentence to the current paragraph
        const currentParagraphIndex = Math.floor(i / 3);
        if (!paragraphs[currentParagraphIndex]) {
            paragraphs[currentParagraphIndex] = '';
        }
        paragraphs[currentParagraphIndex] += sentences[i].trim() + '. ';

        // If this is the 8th sentence or the last sentence, add the paragraph to the result
        if ((i + 1) % 8 === 0 || i === sentences.length - 1) {
            // Remove extra whitespace at the end of the paragraph
            paragraphs[currentParagraphIndex] = paragraphs[currentParagraphIndex].trim();
        }
    }

    // Join the paragraphs with <p> tags and add <hr class="my-5 border-transparent"/> after each paragraph
    const formattedText = paragraphs.map(paragraph => `<p>${paragraph}</p><hr class="my-5 border-transparent"/>`).join('\n');

    return formattedText;
}
