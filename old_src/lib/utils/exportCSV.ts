export function exportCSV(source: string, data: any) {
    if (source === 'lihatKandidat') {
        const header = Object.keys(data[0]).join(',') + '\n';
        const csvRows = data.map((obj: any) => Object.values(obj).join(',') + '\n').join('');
        const csvData = header + csvRows;

        const blob = new Blob([csvData], { type: 'text/csv' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'output.csv';

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    }
}