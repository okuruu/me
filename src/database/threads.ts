interface Threads {
    tweets : string;
    images : string|null,
    timestamp : string;
    replies : number;
    likes : number;
}

export const threads: Threads[] = [
    {
        tweets : 'lakukanlah apapun yang membuatmu bahagia, entah itu buat story random di whatsapp maupun instagram, typing yang dianggap alay, dan pakaian yang itu-itu saja. jangan pernah merubah dirimu sendiri dengan standar yang diciptakan orang lain, kamu berhak atas apa yang kamu punya.',
        images : null,
        timestamp : '2024-04-28 15:08',
        replies : 0,
        likes : 6
    },
    {
        tweets : 'Wkwkwk',
        images : '28042024.jpg',
        timestamp : '2024-04-28 15:00',
        replies : 0,
        likes : 4
    },
    {
        tweets : 'Engga ada makan siang yang gratis. Kencing aja bayar 2k wkwkwk',
        images : null,
        timestamp : '2024-04-28 14:23',
        replies : 0,
        likes : 251342
    }
];