interface Testee {
    CREATED_AT: string;
    ENABLE_TEST: "Yes" | "No";
    GENDER: "Pria" | "Wanita" | null;
    ID: number;
    LEVEL: number;
    LIST: string;
    NAMA: string | null;
    TOKEN: string;
    TTL: string | null;
    UPDATED_AT: string | null;
    WHATSAPP: string | null;
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


export type { Testee, Kraeplin };