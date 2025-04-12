function likesCount(likes: number): string {
    if (likes >= 1000000) {
        return (likes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (likes >= 1000) {
        return (likes / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
    } else {
        return likes.toString();
    }
}

function Carbon(
    date: string | Date,
    type:
        | "date"
        | "date-short"
        | "timestamp"
        | "time"
        | "age"
        | "year"
        | "day"
        | "detailed-age"
        | "date-short-with-time"
        | "countdown"
): string {
    if (date === undefined || date === null || date === "") {
        return "-";
    }

    let dateFormat: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    let dateObj: Date;

    if (typeof date === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(date)) {
        const [hours, minutes, seconds] = date.split(':').map(Number);
        dateObj = new Date();
        dateObj.setHours(hours, minutes, seconds);
    } else {
        dateObj = typeof date === 'string' ? new Date(date) : date;
    }

    const now = new Date();

    if (type === "date") {
        return dateObj.toLocaleDateString('id-ID', dateFormat);
    }

    if (type === "date-short") {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    }

    if (type === "date-short-with-time") {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    if (type === "timestamp") {
        let formattedDate = dateObj.toLocaleDateString('id-ID', dateFormat);
        let timeFormat: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        let formattedTime = dateObj.toLocaleTimeString('id-ID', timeFormat);
        return `${formattedDate} ${formattedTime}`;
    }

    if (type === "time") {
        let timeFormat: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        return dateObj.toLocaleTimeString('id-ID', timeFormat);
    }

    if (type === "age") {
        const today = new Date();
        let age = today.getFullYear() - dateObj.getFullYear();
        const monthDiff = today.getMonth() - dateObj.getMonth();
        const dayDiff = today.getDate() - dateObj.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return `${age} tahun`;
    }

    if (type === "year") {
        const today = new Date();
        const yearsSince = today.getFullYear() - dateObj.getFullYear();
        return `${yearsSince} tahun`;
    }

    if (type === "day") {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - dateObj.getTime());
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return `${daysPassed} hari`;
    }

    if (type === "detailed-age") {
        const today = new Date();
        let years = today.getFullYear() - dateObj.getFullYear();
        let months = today.getMonth() - dateObj.getMonth();
        let days = today.getDate() - dateObj.getDate();

        if (days < 0) {
            months--;
            const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            days += previousMonth;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} tahun, ${months} bulan, ${days} hari`;
    }

    if (type === "countdown") {
        const diff = dateObj.getTime() - now.getTime();

        if (diff <= 0) {
            return '00:00:00';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
    }

    return '';
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    // maximumSignificantDigits: 5,
    minimumFractionDigits: 0
});

function capitalizeEachWord(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function currencySanitizer(input: string | null): number {
    if (!input) return 0;
    const sanitizedAmount = Number(input.toString().replace(/\D/g, ''));
    return sanitizedAmount;
}

export { likesCount, Carbon, capitalizeEachWord, rupiahFormatter, currencySanitizer }