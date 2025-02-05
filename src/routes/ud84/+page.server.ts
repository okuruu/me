import { useString } from "../../library/config/useString";
import { useFetch } from "../../library/hooks/db";

export async function load({fetch}) {
    interface Katalog {
        NAMA_PRODUK: string;
        KETERANGAN: string;
        KETERSEDIAAN_PRODUK: string;
        GAMBAR: string | null;
    }

    let katalog: Katalog[] = [];

    const useFetch = await fetch(useString.url + 'UD84/Master-Produk/Katalog',{
        method: 'get'
    });

    const useResponse = await useFetch.json();

    katalog = useResponse;

    return {
        katalog: katalog ?? []
    }
}