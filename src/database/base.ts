const enableSensitive:boolean = false;

const currently = {
    url : '',
    name : enableSensitive ? 'Gilby Dhilega Yodiaz' : 'Richie',
    workingAt : {
        name : 'Dea Bakery',
        position : 'Head of IT Development',
        companyProfile : 'https://www.linkedin.com/company/dea-bakery/',
    },
    stacks : {
        language : ['Typescript','Dart','Python','SQL','Java','PHP'],
        using : [
            'Svelte','Sveltekit','Bootstrap','DaisyUI','NodeJS',
            'Laravel','Codeigniter','Android Studio','Flutter'
        ],
        databases : ['MySQL','SQLite','Supabase','Firestore']
    }
}

export { currently };