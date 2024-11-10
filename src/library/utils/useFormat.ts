function likesCount(likes: number): string {
    if (likes >= 1000000) {
        return (likes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (likes >= 1000) {
        return (likes / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
    } else {
        return likes.toString();
    }
}

function Carbon(date: string | Date | null, type: "date" | "timestamp" | "time"): string {
    if (date === null || date === "nullTnull") {
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

    return '';
}

export { likesCount, Carbon }