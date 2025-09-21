// Polyfill para evitar erro de libs que chamam BackHandler.removeEventListener
import { BackHandler } from 'react-native';
// Em algumas versões, removeEventListener foi deprecado em favor de remove();
// Garantimos que a função exista para bibliotecas legadas.
if (!(BackHandler as any).removeEventListener && (BackHandler as any).remove) {
  (BackHandler as any).removeEventListener = (eventName: string, handler: () => void) => {
    try {
      (BackHandler as any).remove(eventName, handler);
    } catch {}
  };
}
