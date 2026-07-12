interface SectionBase {
    label: string;
    heading: string;
}

export interface TextSection extends SectionBase {
    type: 'text';
    body: string;
}

export interface ListSection extends SectionBase {
    type: 'list';
    items: string[];
}

export interface CardsSection extends SectionBase {
    type: 'cards';
    cards: { title: string; description: string }[];
}

export interface MetricsSection extends SectionBase {
    type: 'metrics';
    metrics: { value: string; label: string }[];
}

export interface StepsSection extends SectionBase {
    type: 'steps';
    steps: { title: string; description: string; image: string }[];
}

export interface ImageSection extends SectionBase {
    type: 'image';
    src: string;
    alt: string;
    caption?: string;
}

export type ProjectSection =
    | TextSection
    | ListSection
    | CardsSection
    | MetricsSection
    | StepsSection
    | ImageSection;

export interface Project {
    slug: string;
    number: string;
    tab: 'systems' | 'automation';
    category: string;
    status: string;
    title: string;
    subtitle: string;
    tags: string[];
    miniImage: string;
    meta: {
        team: string;
        role: string;
        tools: string;
        status: string;
    };
    links?: {
        playStore?: string;
        appStore?: string;
        live?: string;
        github?: string;
    };
    sections: ProjectSection[];
}

