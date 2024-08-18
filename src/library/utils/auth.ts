
import { goto } from '$app/navigation';
import toast, { Toaster } from 'svelte-french-toast';

async function logOut(): Promise <void> {
    localStorage.removeItem('localPIN');  
    localStorage.removeItem('user');
    toast('See you soon!', { icon : '👋' }); 
    return goto('/clyfar');
}

export { logOut };