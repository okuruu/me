/**
 * One row of ud84_transaksi_log. The table is keyed by UNIQUE_TRANSAKSI,
 * which is a sale's UNIQUE or an order's KODE -- the same audit trail serves
 * both, so the shape is shared rather than declared twice.
 */
export interface Riwayat {
    ID: number;
    AKSI: string;
    OPERATOR: string | null;
    ALASAN: string | null;
    CATATAN_SISTEM: string | null;
    CREATED_AT: string;
}
