interface Testee {
    CREATED_AT: string;
    ENABLE_TEST: string;
    GENDER: string;
    ID: number;
    LEVEL: string | null;
    LIST: string | null;
    NAMA: string | null;
    TOKEN: string;
    TTL: string | null;
    UPDATED_AT: string | null;
    WHATSAPP: string | null;
    IS_EDITED : boolean;
}

interface RMIB {
    Pria: string[][];
    Wanita: string[][];
}

interface MSDT {
    rawjawaban: {
        index: number;
        value: string
    }[];
    A: number[];
    B: number[];
    koreksi: number[];
    jumlah: number[];
    O: number;
    E: number;
    RO: number;
    TO: number;
    konversiE: number;
    konversiRO: number;
    konversiTO: number;
    line1: string[];
    line2: string[];
    resultMSDT: string;
    deskripsi: string;
}

interface Kraeplin {
    MEAN: number;
    RANGE: number;
    AV_DEVIATION: number;
    SUM_OF_ERROR: number;
    SUM_OF_SKIPPED: number;
    SUM_OF_RIGHT: number;
    SUM_OF_ANSWER: number;
    MIN: number;
    MAX: number;
    SUM_OF_TEST: number;
    FASE: {
        FASE_1: number;
        FASE_2: number;
        FASE_3: number;
        SEMUA: number;
    };
    PANKER: {
        NILAI: number;
        FASE_1: number;
        FASE_2: number;
        FASE_3: number;
    };
    TINKER: {
        NILAI: number;
        FASE_1: number;
        FASE_2: number;
        FASE_3: number;
    };
    JANKER: {
        NILAI: number;
        FASE_1: number;
        FASE_2: number;
        FASE_3: number;
    };
    GRAPH: number[];
}

interface DiscScores {
    D: number | null;
    I: number | null;
    S: number | null;
    C: number | null;
    toArray(): (number | null)[];
}

interface DISC {
    Most: DiscScores;
    Least: DiscScores;
    Change: DiscScores;
}

interface RMIBValue {
    [key: string]: number;
}

interface RMIBResult {
    out: string[];
    me: string[];
    comp: string[];
    sci: string[];
    prs: string[];
    aesth: string[];
    lit: string[];
    mus: string[];
    ss: string[];
    cler: string[];
    prac: string[];
    med: string[];
    VALUE: RMIBValue;
    SORTED_VALUE: RMIBValue;
}

interface CFIT {
    FIRST: string[];
    TWO: string[];
    THIRD: string[];
    FOURTH: string[];
    SAMPLE : string[];
}

interface CFITResult {
    score : number;
    resultScore: number;
    resultStatus : string;
}

export type { Testee, RMIB, RMIBResult, Kraeplin, MSDT, DISC, CFIT, CFITResult };