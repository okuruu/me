export interface Detail {
    QUANTITY: number;
    NAMA: string;
    SATUAN: string | null;
    HARGA: number;
    JUMLAH: number;
}

/**
 * Every figure the totals block prints, derived server-side in
 * Report::getInvoices so DL and thermal cannot disagree.
 *
 * TOTAL_TAGIHAN is rekap.TOTAL, which is already net of POTONGAN.
 * SISA and KEMBALIAN are derived from CASH + DP; the stored
 * rekap.KEMBALIAN ignores DP and is not used.
 */
export interface Ringkasan {
    TOTAL_BARANG: number;
    POTONGAN: number;
    TOTAL_TAGIHAN: number;
    CASH: number;
    DP: number;
    SISA: number;
    KEMBALIAN: number;
}

export interface Rekap {
    ID: number;
    UNIQUE: string;
    NAMA: string;
    CASH: number;
    DP: number;
    JATUH_TEMPO: string | null;
    KETERANGAN: string | null;
    TOTAL: number;
    CREATED_AT: string;
    UPDATED_AT: string | null;
}

export interface Receipt {
    tanggal: string;
    tuan: string;
    alamat: string;
    point: number;
    total: number;
    data: Detail[];
    ringkasan: Ringkasan;
    rekap: Rekap;
}

export const emptyReceipt: Receipt = {
    tanggal: '',
    tuan: '',
    alamat: '',
    point: 0,
    total: 0,
    data: [],
    ringkasan: {
        TOTAL_BARANG: 0,
        POTONGAN: 0,
        TOTAL_TAGIHAN: 0,
        CASH: 0,
        DP: 0,
        SISA: 0,
        KEMBALIAN: 0
    },
    rekap: {
        ID: 0,
        UNIQUE: '',
        NAMA: '',
        CASH: 0,
        DP: 0,
        JATUH_TEMPO: null,
        KETERANGAN: null,
        TOTAL: 0,
        CREATED_AT: '',
        UPDATED_AT: null
    }
};
