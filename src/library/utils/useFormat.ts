function likesCount(likes: number): string {
    if (likes >= 1000000) {
        return (likes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (likes >= 1000) {
        return (likes / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
    } else {
        return likes.toString();
    }
}

function Carbon(date: string | Date, type: "date" | "timestamp" | "time" | "age" | "year" | "day"): string {
    let dateFormat: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    let dateObj: Date;

    // Check if the input is a time string
    if (typeof date === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(date)) {
        const [hours, minutes, seconds] = date.split(':').map(Number);
        dateObj = new Date();
        dateObj.setHours(hours, minutes, seconds);
    } else {
        dateObj = typeof date === 'string' ? new Date(date) : date;
    }

    // Format for "date" type
    if (type === "date") {
        return dateObj.toLocaleDateString('id-ID', dateFormat);
    }

    // Format for "timestamp" type (date and time)
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

    // Format for "time" type (time only)
    if (type === "time") {
        let timeFormat: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        return dateObj.toLocaleTimeString('id-ID', timeFormat);
    }

    // Calculate "age" based on the date
    if (type === "age") {
        const today = new Date();
        let age = today.getFullYear() - dateObj.getFullYear();
        const monthDiff = today.getMonth() - dateObj.getMonth();
        const dayDiff = today.getDate() - dateObj.getDate();

        // Adjust age if the birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return `${age} tahun`;
    }

    // Calculate "year" difference without birthday adjustment
    if (type === "year") {
        const today = new Date();
        const yearsSince = today.getFullYear() - dateObj.getFullYear();
        return `${yearsSince} tahun`;
    }

    // Calculate "day" difference
    if (type === "day") {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - dateObj.getTime());
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return `${daysPassed} hari`;
    }

    // Default return (optional, based on your needs)
    return '';
}

function capitalizeEachWord(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export { likesCount, Carbon, capitalizeEachWord }