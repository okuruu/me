export function formatTextIntoParagraphs(text: string): string {
    // Split the text into an array of sentences
    const sentences = text.split(/[.!?]/);

    // Initialize an empty array to store formatted paragraphs
    const paragraphs: string[] = [];

    // Iterate over the sentences array
    for (let i = 0; i < sentences.length; i++) {
        // Append each sentence to the current paragraph
        const currentParagraphIndex = Math.floor(i / 4);
        if (!paragraphs[currentParagraphIndex]) {
            paragraphs[currentParagraphIndex] = '';
        }
        paragraphs[currentParagraphIndex] += sentences[i].trim() + '. ';

        // If this is the 4th sentence or the last sentence, add the paragraph to the result
        if ((i + 1) % 4 === 0 || i === sentences.length - 1) {
            // Remove extra whitespace at the end of the paragraph
            paragraphs[currentParagraphIndex] = paragraphs[currentParagraphIndex].trim();
        }
    }

    // Join the paragraphs with <p> tags and two line breaks between paragraphs
    const formattedText = paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('\n\n');

    return formattedText;
}
