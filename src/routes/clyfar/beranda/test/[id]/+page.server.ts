export function load({params}) {
    let title: string = '';
    let password: string = '';
    
    if (params.id == 'rmib') {
        title = 'RMIB';
        password = 'Felfare';
    }

    return {
        id : params.id,
        title: title,
        password: password
    }
}