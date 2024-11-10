const isProduction: boolean = false;
const useString = {
    url : isProduction ? 'https://fae.deabakery.co.id/api/' : 'http://localhost:8000/api/',
    rawURL : isProduction ? 'https://fae.deabakery.co.id/' : 'http://localhost:8000/',
    pageTitle : 'okuruu - hello there',
    name : 'Esdelfron',
    bio : 'Lórien Loremaster of Languages',
    github : {
        url : 'https://github.com/okuruu',
        username : '@okuruu'
    },
    about : `Hey there, I'm Gilby, a Fullstack Developer on a mission to turn ideas into digital delights. Armed with my trusty keyboard and fueled by endless snacks, I tame bugs and craft user experiences that spark joy. Also, i love maths!`,
    keywords : `Okuruu's Fullstack Developer Portfolio, Portofolio, Fullstack Developer`,
    experience : [
        {
            name : 'UTHM',
            year : 2020,
            achievement : 'Anugerah Artikel Prosiding Terbaik',
            desc : '<p class="text-muted">This prestigious award, "Anugerah Artikel Prosiding Terbaik," recognizes outstanding contributions to academic discourse in the proceedings category.</p>'
        },
        {
            name : 'Dea Bakery',
            year : 'Present',
            achievement : 'Head of Information Technology',
            desc : `
                <ul class="text-muted">
                    <li>Led development team</li>
                    <li>Building POS, Internal Management System, and various projects</li>
                </ul>
            `
        }
    ]
}

export { useString }