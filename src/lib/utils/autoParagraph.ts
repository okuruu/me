export function formatTextIntoParagraphs(text: string): string {
    const sentences = text.split(/[.!?]/);
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
        const currentParagraphIndex = Math.floor(i / 3);
        if (!paragraphs[currentParagraphIndex]) {
            paragraphs[currentParagraphIndex] = '';
        }
        paragraphs[currentParagraphIndex] += sentences[i].trim() + '. ';
        if ((i + 1) % 8 === 0 || i === sentences.length - 1) {
            paragraphs[currentParagraphIndex] = paragraphs[currentParagraphIndex].trim();
        }
    }
    const formattedText = paragraphs.map(paragraph => `<p>${paragraph}</p><hr class="my-5 border-transparent"/>`).join('\n');
    return formattedText;
}
