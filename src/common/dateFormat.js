/**
 * Formats a date string to "DD/MM/YYYY HH:mm"
 * @param {string | Date} dateInput - The ISO date string or Date object
 * @returns {string} - Formatted date or empty string if invalid
 */
export const formatDateTime = (dateInput) => {
    if (!dateInput) return "";

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};