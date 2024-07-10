const secureInfo:boolean = false;

const baseConfig = {
    url : '',
    name : secureInfo ? 'Gilby Dhilega Yodiaz' : 'Richie',
    workingAt : {
        name : 'Dea Bakery',
        shorts: 'Lórien Loremaster of Languages',
        position : 'Head of Information Technology',
        companyProfile : 'https://www.linkedin.com/company/dea-bakery/',
        doingWhat : "Led development team, Building Point of Sales (POS), Internal Management System, and various other projects.",
        skills : [
            { name : 'Sveltekit', url : 'https://kit.svelte.dev/' },
            { name : 'Tauri', url : 'https://tauri.app/' },
            { name : 'Flutter', url : 'https://flutter.dev/' },
            { name : 'DaisyUI', url : 'https://daisyui.com/' },
        ],
        github : {
            display : '@okuruu',
            url : "https://github.com/okuruu"
        },
        bio : "Hey there, I'm Gilby, a Fullstack Developer on a mission to turn ideas into digital delights. Armed with my trusty keyboard and fueled by endless snacks, I tame bugs and craft user experiences that spark joy. "
    },
    stacks : {
        language : ['Typescript','Dart','Python','SQL','Java','PHP','Rust'],
        using : [
            'Svelte','Sveltekit','Bootstrap','DaisyUI','NodeJS',
            'Laravel','Codeigniter','Android Studio','Flutter', 'Tauri'
        ],
        databases : ['MySQL','SQLite','Supabase','Firestore']
    }
}

export { baseConfig };