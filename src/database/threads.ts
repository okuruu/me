interface Threads {
    tweets : string;
    images : string|null,
    timestamp : string;
    replies : number;
    likes : number;
    reply : {
        view : boolean,
        replies: {
            tweets: string;
            images : string|null
        }[]   
    }
}

export const threads: Threads[] = [
    {
        tweets : 'Kalau dalam Kejawen, ini disebut Renggati atau Renggat nang jero ati, yaitu saat kita melihat sesuatu terutama yg tidak pernah kita lihat visualnya sedang mencoba berinteraksi dengan kita, apa pun itu selalu ada maksud tersembunyi dan memang gak ada salahnya untuk berjaga-jaga.',
        images : null,
        timestamp : '2024-04-28 15:08',
        replies : 0,
        likes : 6,
        reply : {
            view : false,
            replies :[{
                tweets : 'seperti yg terjadi pada beliau ini, mungkin secara gak langsung si wanita berpakaian hijau ini sedang mencoba berinteraksi dan tentu saja ada sesuatu yg sedang dia inginkan.',
                images : null
            },
            {
                tweets : 'dulu, si mbah melakukan Wijih, yaitu membaca petunjuk dengan meletakkan telur ayam kampung di dalam besek ',
                images : null
            },
            {
                tweets : 'tapi ya sekali lagi, yg di lakukan si mbah saya dulu itu untuk sekedar berjaga-jaga, karena kaum dari bangsa Jin memang sukar dipercaya, karena memang begitulah tugas mereka bahkan sampai di akhir zaman.',
                images : null
            },
            {
                tweets : 'kalau nulis ini jadi flashback, waktu sepupu saya kena ini, gak bisa bangun berhari-hari karena si mbah telat menyadari, telur ayam yg ditaruh di besek isi nya darah dengan noda hitam kental, tapi setelah melewati berbagai prosesi, sepupu akhirnya selamat, tapi ya linglung..',
                images : null
            },
            {
                tweets : 'diselidiki sama si mbah, ternyata sepupu keberatan nama, jadi badannya gak kuat, setelah nama sepupu diganti, alhamdulillah sampai sekarang kejadian itu gak pernah lagi sambang di kehidupannya. ',
                images : null
            }],
        }
    },
    {
        tweets : 'lakukanlah apapun yang membuatmu bahagia, entah itu buat story random di whatsapp maupun instagram, typing yang dianggap alay, dan pakaian yang itu-itu saja. jangan pernah merubah dirimu sendiri dengan standar yang diciptakan orang lain, kamu berhak atas apa yang kamu punya.',
        images : null,
        timestamp : '2024-04-28 15:08',
        replies : 0,
        likes : 6,
        reply : {
            view : false,
            replies : []
        }
    },
    {
        tweets : 'Wkwkwk',
        images : '28042024.jpg',
        timestamp : '2024-04-28 15:00',
        replies : 0,
        likes : 4,
        reply : {
            view : false,
            replies : []
        }
    },
    {
        tweets : 'Engga ada makan siang yang gratis. Kencing aja bayar 2k wkwkwk',
        images : null,
        timestamp : '2024-04-28 14:23',
        replies : 0,
        likes : 251342,
        reply : {
            view : false,
            replies : []
        }
    }
];