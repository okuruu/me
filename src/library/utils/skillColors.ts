const colorMap: Record<string, string> = {
    // Languages
    'TypeScript': '#3178C6',
    'JavaScript': '#C4940A',
    'PHP': '#7B7FB5',
    'Python': '#3776AB',
    'Dart': '#0175C2',
    'Rust': '#CE4A02',
    'SQL': '#4479A1',
    'Java': '#ED8B00',
    // Frameworks & runtimes
    'SvelteKit': '#FF3E00',
    'Svelte': '#FF3E00',
    'Laravel': '#FF2D20',
    'Flutter': '#02569B',
    'Node.js': '#339933',
    'Express.js': '#888888',
    'Tauri': '#C49B0A',
    'Codeigniter': '#EF292A',
    'React': '#00AECC',
    'Vue': '#42B883',
    // Databases
    'MySQL': '#4479A1',
    'Supabase': '#3ECF8E',
    'Oracle Database': '#C74634',
    'PostgreSQL': '#336791',
    'MongoDB': '#47A248',
    'Redis': '#DC382D',
    // AI & Data
    'Mastra': '#6366F1',
    'Ollama': '#7C3AED',
    'Pandas': '#4C72B0',
    'Google Data Studio': '#4285F4',
    // Tools & DevOps
    'Git': '#F05032',
    'Linux': '#C49B0A',
    'Jira': '#0052CC',
    'Figma': '#A259FF',
    'Android Studio': '#3DDC84',
    'Notion': '#888888',
    'Docker': '#2496ED',
    'GitHub': '#6E7681',
    'Vercel': '#666666',
    // UI
    'Tailwind CSS': '#0EA5E9',
    'DaisyUI': '#7C3AED',
    'Bootstrap': '#7952B3',
    'Electron': '#47848F',
    'Baileys': '#25D366',
    // Runtimes
    'Bun': '#FBF0DF',
    // Systems / Frameworks
    'Rocket': '#CE4A02',
    'CodeIgniter': '#EF292A',
    // Databases
    'SQLite': '#003B57',
    'Firestore': '#FFCA28',
    // Tools
    'Photoshop': '#31A8FF',
    'Premiere': '#9999FF',
    'Cursor': '#888888',
    'Looker Studio': '#4285F4',
    'Grafana': '#F46800',
    'Coda': '#F46A54',
    'Trello': '#0079BF',
    'Antigravity': '#A259FF',
    // Environment
    'CachyOS': '#D8704A',
    'CachyOS (Current)': '#D8704A',
    'Arch Linux': '#1793D1',
    'CentOS': '#262577',
    'Debian': '#A80030',
    'Ubuntu': '#E95420',
    'Mint': '#87CF3E',
};

function hexToRgb(hex: string): string {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `${r},${g},${b}`;
}

export function getSkillStyle(skill: string): string {
    const hex = colorMap[skill] ?? '#888888';
    const rgb = hexToRgb(hex);
    return `background:rgba(${rgb},0.12);border-color:rgba(${rgb},0.3);color:rgb(${rgb})`;
}

