import { phraseBox } from "./phraseBox"

let currentWorkplace = {
    company: 'Dea Bakery',
    position: 'Head of IT Development',
    since: 'Jan 2023',
    impact: [
        'Scaled outlet system across multiple branches',
        'Built and maintained high-performance POS system with real-time reliability',
        'Developed HRIS & internal systems to streamline operations',
        'Launched membership app with integrated payment systems',
        'Built AI assistant for customer support automation',
        'Led cross-functional team of engineers and designers'
    ]
};

let generalKnowledge = {
    language: ['TypeScript', 'PHP', 'Rust', 'Python', 'Dart', 'SQL', 'Java'],
    using: [
        'SvelteKit', 'React', 'Next.js', 'Tauri', 'Bootstrap', 'DaisyUI',
        'NodeJS', 'Laravel', 'CodeIgniter', 'Flutter',
        'Rocket', 'Bun', 'Android Studio'
    ],
    databases: ['MySQL', 'PostgreSQL', 'SQLite', 'Supabase', 'Firestore'],
    tools: [
        'Figma', 'Photoshop', 'Premiere', 'Trello', 'Jira', 'Notion', 'Coda',
        'Looker Studio', 'Pandas', 'Git', 'Docker', 'Grafana',
        'Antigravity', 'Cursor', 'Claude Code', 'Mastra'
    ],
    os: 'Arch Linux'
};

function aboutMe() {
    return {
        name: 'Gilby Dhilega Yodiaz',
        role: 'Full-Stack Software Engineer',
        experience: '5+ years',
        focus: ['Web', 'Mobile', 'Desktop', 'AI'],
        knowledge: generalKnowledge,
        workingAt: currentWorkplace,
        funFact: 'I build systems, automate chaos, and occasionally fight bugs like a boss fight 🎮'
    };
}

const useString = {
    url: phraseBox.url,
    rawURL: phraseBox.rawLink,
    pageTitle: 'Gilby — Fullstack Engineer',
    name: 'Esdelfron',
    bio: 'Lórien Loremaster of Languages',
    knowledge: generalKnowledge,
    currentWorkplace: currentWorkplace,
    github: {
        url: 'https://github.com/okuruu',
        username: '@okuruu'
    },
    about: `Hey, I'm Gilby — a Full-Stack Software Engineer who builds systems that actually survive production. I focus on turning complex business problems into scalable, maintainable solutions — from architecture to deployment.`,

    keywords: `Gilby Dhilega Yodiaz, Fullstack Engineer Indonesia, System Architect, Portfolio`,

    experience: [
        {
            name: 'Dea Bakery',
            year: '2023 - Present',
            achievement: 'Head of IT Development',
            desc: `
                <ul class="list-disc px-3">
                    <li>Led development of internal systems and POS</li>
                    <li>Designed scalable architecture across multiple outlets</li>
                    <li>Built automation tools and AI-driven assistant</li>
                    <li>Managed and mentored engineering team</li>
                </ul>
            `
        }
    ],

    academicHonors: [
        {
            title: 'Best Proceedings Article',
            place: 'Universiti Tun Hussein Onn Malaysia (UTHM)',
            year: 2020
        },
        {
            title: 'National University Debate Championship (NUDC) - Provincial Finalist',
            year: 2019
        },
        {
            title: '3rd Place Technical Support Competition (Malang)',
            year: null
        }
    ],

    volunteering: [
        {
            role: 'Super Mentor',
            org: 'Dealls (YC W22)',
            year: '2024 - Present',
            desc: 'Providing 1-on-1 career and technical mentorship to students and professionals.'
        },
        {
            role: 'Featured Qur’anic Reciter',
            org: 'Dea Bakery Events',
            year: '2024 - 2025',
            desc: 'Selected as Qori for company events and formal openings.'
        },
        {
            role: 'Qur’an Coordinator',
            org: 'Dea Bakery',
            year: '2022 - Present',
            desc: 'Teaching recitation and building tracking system for employee progress.'
        },
        {
            role: 'Qur’anic Studies Instructor',
            org: 'Pondok Pesantren Balesari',
            year: '2018 - 2019',
            desc: 'Teaching foundational Quranic reading (Iqro).'
        }
    ]
}

export { useString, aboutMe, currentWorkplace, generalKnowledge }
