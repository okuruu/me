export async function load({params}) {
    let pageTitle: string = 'Item Keluar';

    if (params.id === "item-masuk") {
        pageTitle = 'Item Masuk';
    }

    return {
        pageUrl: params.id,
        pageTitle: pageTitle
    }
}