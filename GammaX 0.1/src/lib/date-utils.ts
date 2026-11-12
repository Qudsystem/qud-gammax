export function formatDistanceToNow(date: number | Date, options?: { addSuffix?: boolean }): string {
    const now = new Date().getTime();
    const diff = now - (date instanceof Date ? date.getTime() : date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let result = '';
    if (days > 0) result = `${days} day${days > 1 ? 's' : ''}`;
    else if (hours > 0) result = `${hours} hour${hours > 1 ? 's' : ''}`;
    else if (minutes > 0) result = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    else result = 'just now';

    if (options?.addSuffix && result !== 'just now') {
        return `${result} ago`;
    }
    return result;
}

export function format(date: Date, formatStr: string): string {
    // Simple mock for MMM dd HH:mm
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month} ${day} ${hours}:${minutes}`;
}
