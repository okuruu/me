/**
 * The panel operator's name, for actions that are audited.
 *
 * Sessions opened before the login page started storing { name, privilege }
 * hold a bare `true`, so the name can legitimately be missing; callers send
 * an empty string and the backend records 'Tidak diketahui' rather than
 * refusing the action. localStorage access is guarded because a throw here
 * would take down whatever the operator was trying to do.
 */
export function operatorSaatIni(): string {
    try {
        const stored = localStorage.getItem('Auth');
        const parsed = stored ? JSON.parse(stored) : null;

        return typeof parsed?.name === 'string' ? parsed.name : '';
    } catch {
        return '';
    }
}
