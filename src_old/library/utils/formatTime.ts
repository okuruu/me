function formatTime(date: string){
    const currentDate = new Date();
    const inputDate = new Date(date);

    const timeDifferenceInMilliseconds = currentDate.getTime() - inputDate.getTime();
    const timeDifferenceInSeconds = timeDifferenceInMilliseconds / 1000;

    if (timeDifferenceInSeconds < 60) {
        return `${Math.floor(timeDifferenceInSeconds)}s`; // seconds
    } else if (timeDifferenceInSeconds < 3600) {
        return `${Math.floor(timeDifferenceInSeconds / 60)}m`; // minutes
    } else if (timeDifferenceInSeconds < 86400) {
        return `${Math.floor(timeDifferenceInSeconds / 3600)}h`; // hours
    } else if (timeDifferenceInSeconds < 2592000) {
        return `${Math.floor(timeDifferenceInSeconds / 86400)}d`; // days
    } else {
        return `${Math.floor(timeDifferenceInSeconds / 2592000)}M`; // months
    }
}

function estimateAge(birthDateString: string | null): number | null {
    if (!birthDateString) {
        return null; // Return null if the input is null
    }

    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    // If the birth date hasn't occurred yet this year, subtract one from the age
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }

    return age;
}

export { formatTime, estimateAge };