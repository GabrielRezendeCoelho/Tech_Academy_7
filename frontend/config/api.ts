// Centralização da URL base da API.
// Detecta IP local em ambiente de desenvolvimento (Expo) quando possível.
// Fallback: variável de ambiente EXPO_PUBLIC_API_URL ou localhost.

import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

function getLocalIpFallback(): string | null {
  // Em runtime móvel não temos acesso direto à lista de IPs.
  // Usuário pode definir EXPO_PUBLIC_API_URL no app.config/app.json (extra) ou env.
  // Aqui apenas retornamos null para usar fallback.
  return null;
}

// Tenta extrair o IP do bundle servido pelo Metro (ex: http://192.168.0.15:19000/...)
function detectFromMetro(): { url: string | null; debug: Record<string, any> } {
  const debug: Record<string, any> = {};
  try {
    // @ts-ignore
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    debug.scriptURL = scriptURL;
    if (!scriptURL) return { url: null, debug };
    // Normaliza barras invertidas (às vezes aparecem em logs no Windows) para evitar falha no URL()
    const normalized = scriptURL.replace(/\\/g, '/');
    debug.normalized = normalized;
    try {
      const u = new URL(normalized);
      debug.parsed = { protocol: u.protocol, host: u.host, hostname: u.hostname, port: u.port };
      // Se hostname for um IP (v4) e não for localhost, usamos esse host com porta 3000
      if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname) && u.hostname !== '127.0.0.1') {
        const candidate = `${u.protocol}//${u.hostname}:3000`;
        return { url: candidate, debug };
      }
    } catch (inner) {
      debug.urlParseError = (inner as Error).message;
    }
    // Regex fallback antigo
    const m = normalized.match(/^(https?:\/\/)([0-9\.]+):\d+/);
    if (m) {
      const candidate = `${m[1]}${m[2]}:3000`;
      return { url: candidate, debug: { ...debug, regexMatch: m[0] } };
    }
    return { url: null, debug };
  } catch (e) {
    debug.error = (e as Error).message;
    return { url: null, debug };
  }
}

function detectFromConstants(): { url: string | null; debug: Record<string, any> } {
  const debug: Record<string, any> = {};
  try {
    // Em builds dev o host costuma estar em Constants.expoConfig?.hostUri ou debug manifest
    // @ts-ignore
    const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest2?.debuggerHost || (Constants as any)?.manifest?.debuggerHost;
    debug.hostUri = hostUri;
    if (!hostUri || typeof hostUri !== 'string') return { url: null, debug };
    // hostUri ex: 192.168.15.13:8081 ou 192.168.15.13:19000
    const hostMatch = hostUri.match(/^([0-9\.]+):\d+$/);
    if (hostMatch) {
      const ip = hostMatch[1];
      if (ip && ip !== '127.0.0.1') {
        return { url: `http://${ip}:3000`, debug };
      }
    }
    return { url: null, debug };
  } catch (e) {
    debug.error = (e as Error).message;
    return { url: null, debug };
  }
}

const ENV_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
const metroResult = !ENV_URL ? detectFromMetro() : { url: null, debug: {} };
const constantsResult = !ENV_URL && !metroResult.url ? detectFromConstants() : { url: null, debug: {} };

let base = ENV_URL || metroResult.url || constantsResult.url || 'http://localhost:3000';

// Heurística: se estamos em dispositivo físico e a URL ainda é localhost, instruir a substituir manualmente.
// O desenvolvedor pode editar este arquivo e fixar o IP da máquina, ex: 'http://192.168.0.10:3000'
if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(base)) {
  const ip = getLocalIpFallback();
  if (ip) {
    base = `http://${ip}:3000`;
  }
}

export const API_BASE = base.replace(/\/$/, '');
// Log apenas em dev para confirmar no console do Metro / Expo Go
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[API] Base URL ativa =>', API_BASE,
    '\n[DEBUG] ENV_URL =', ENV_URL,
    '\n[DEBUG] Metro =', metroResult.debug,
    '\n[DEBUG] Constants =', constantsResult.debug
  );
}

export function api(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path.startsWith('/') ? path : '/' + path}` , options);
}

// Helper para requisições autenticadas
export async function authFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return api(path, { ...options, headers });
}

// Nota: Para produção configurar EXPO_PUBLIC_API_URL.
// Exemplo (PowerShell): $env:EXPO_PUBLIC_API_URL="http://192.168.0.10:3000"; npx expo start
