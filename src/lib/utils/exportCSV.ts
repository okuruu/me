export function exportCSV(source: string, data: any) {
    if (source === 'lihatKandidat') {
        // Create CSV content
        const header = Object.keys(data[0]).join(',') + '\n';
        const csvRows = data.map((obj: any) => Object.values(obj).join(',') + '\n').join('');
        const csvData = header + csvRows;

        // Create Blob object
        const blob = new Blob([csvData], { type: 'text/csv' });

        // Create anchor element for download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'output.csv';

        // Trigger download
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
    }
}