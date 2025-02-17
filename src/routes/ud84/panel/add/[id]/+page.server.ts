export async function load({params}) {
    let pageTitle: string = 'Tambah Item Keluar';

    if (params.id === "item-masuk") {
        pageTitle = 'Tambah Item Masuk';
    }

    return {
        pageUrl: params.id,
        pageTitle: pageTitle
    }
}