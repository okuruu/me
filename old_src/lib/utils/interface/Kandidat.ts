interface Candidate {
    CREATED_AT: string;
    ENABLE_TEST: "Yes" | "No";
    GENDER: "Pria" | "Wanita";
    ID: number;
    LEVEL : string;
    LIST : string;
    NAMA : string;
    TOKEN : string;
    TTL : Date | null
    UPDATED_AT : Date | null;
    WHATSAPP : string;
};

export type { Candidate };