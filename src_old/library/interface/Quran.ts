interface Chapters{
    id: number;
    name : string;
    transliteration: string;
    translation: string;
    type : "meccan" | "medinan";
    total_verses: number;
}

export type { Chapters };