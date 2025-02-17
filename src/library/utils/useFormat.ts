function likesCount(likes: number): string {
    if (likes >= 1000000) {
        return (likes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (likes >= 1000) {
        return (likes / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
    } else {
        return likes.toString();
    }
}

function Carbon(date: string | Date, type: "date" | "date-short" | "timestamp" | "time" | "age" | "year" | "day" | "detailed-age"): string {
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

    if (type === "date") {
        return dateObj.toLocaleDateString('id-ID', dateFormat);
    }

    if (type === "date-short") {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
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

export { likesCount, Carbon, capitalizeEachWord, rupiahFormatter }