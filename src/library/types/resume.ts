export interface Service {
    title: string;
    description: string;
}

export interface ProcessStep {
    step: number;
    title: string;
    description: string;
}

export interface ResumeEntry {
    title: string;
    company?: string;
    degree?: string;
    school?: string;
    period: string;
    description?: string;
    scholarship?: string;
}

export interface SkillGroup {
    category: string;
    tools: string[];
}

export interface Stat {
    value: string;
    label: string;
}

