/**
 * base44Client.ts
 * ----------------
 * Base44 client wrapper for FIG Gallery.
 *
 * IMPORTANT:
 * - Base44 is INCLUDED but DISABLED by default
 * - App is 100% offline-first
 * - This file exists for future sync / migration only
 *
 * RULES:
 * - Never auto-call network
 * - Never block UI
 * - Never assume connectivity
 */

type Base44Config = {
  baseUrl?: string;
  apiKey?: string;
  enabled?: boolean;
};

const DEFAULT_CONFIG: Base44Config = {
  enabled: false,
};

let config: Base44Config = { ...DEFAULT_CONFIG };

/**
 * Initialize Base44 client (NO-OP unless enabled)
 */
export function initBase44(userConfig?: Base44Config) {
  config = {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };
}

/**
 * Check if Base44 is enabled
 */
export function isBase44Enabled(): boolean {
  return !!config.enabled;
}

/**
 * Safe fetch wrapper
 * Will throw if Base44 is disabled
 */
async function safeFetch(
  path: string,
  options?: RequestInit
): Promise<any> {
  if (!config.enabled || !config.baseUrl) {
    throw new Error("Base44 is disabled");
  }

  const res = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(config.apiKey
        ? { Authorization: `Bearer ${config.apiKey}` }
        : {}),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Base44 request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Entities API (stubbed)
 */
export const base44Entities = {
  async list(_entity: string) {
    if (!isBase44Enabled()) return [];
    return safeFetch(`/entities/${_entity}`);
  },
};

/**
 * Functions API (stubbed)
 */
export const base44Functions = {
  async invoke(_fn: string, _payload?: any) {
    if (!isBase44Enabled()) {
      throw new Error("Base44 is disabled");
    }
    return safeFetch(`/functions/${_fn}`, {
      method: "POST",
      body: JSON.stringify(_payload ?? {}),
    });
  },
};

/**
 * Auth API (explicitly disabled)
 */
export const base44Auth = {
  login() {
    throw new Error("Base44 auth disabled in FIG Gallery");
  },
  logout() {
    throw new Error("Base44 auth disabled in FIG Gallery");
  },
};
