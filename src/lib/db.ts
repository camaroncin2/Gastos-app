// Database access for the app.
//
// The PostgreSQL server lives on a private LAN machine and is reached
// through a small authenticated HTTP proxy exposed via Tailscale Funnel.
// This client only knows a fixed set of named operations — it never sends
// raw SQL — matching the operations the proxy is willing to run.

const PROXY_URL = process.env.DB_PROXY_URL;
const PROXY_SECRET = process.env.DB_PROXY_SECRET;

type Json = Record<string, unknown>;

async function call(op: string, args: Json): Promise<Record<string, unknown>> {
  if (!PROXY_URL || !PROXY_SECRET) {
    throw new Error("DB_PROXY_URL / DB_PROXY_SECRET are not configured");
  }
  const res = await fetch(`${PROXY_URL.replace(/\/+$/, "")}/q`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PROXY_SECRET}`,
    },
    body: JSON.stringify({ op, args }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`db proxy "${op}" failed with status ${res.status}`);
  }
  return res.json();
}

export interface UserRow {
  id: string;
  name: string;
  password_hash: string;
}

export interface FullUserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
}

export interface DataRow {
  data: string | null;
}

export const db = {
  /** Returns the matching user row, or [] if no user has that email. */
  async findUserByEmail(email: string): Promise<UserRow[]> {
    const r = await call("findUserByEmail", { email });
    return (r.rows ?? []) as unknown as UserRow[];
  },

  /** Creates a user and its empty app_data row (atomically). */
  async createUser(u: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<void> {
    await call("createUser", u);
  },

  /** Returns the user row (incl. email + hash) by id, or [] if none. */
  async getUserById(id: string): Promise<FullUserRow[]> {
    const r = await call("getUserById", { id });
    return (r.rows ?? []) as unknown as FullUserRow[];
  },

  /** Replaces the password hash for a user. */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await call("updatePassword", { id, passwordHash });
  },

  /** Returns the stored data blob for a user, or [] if none. */
  async getData(userId: string): Promise<DataRow[]> {
    const r = await call("getData", { userId });
    return (r.rows ?? []) as unknown as DataRow[];
  },

  /** Inserts or updates the data blob for a user. */
  async setData(userId: string, data: string): Promise<void> {
    await call("setData", { userId, data });
  },

  // --- Login rate limiting (state kept in the always-on proxy process) ---

  /** Returns whether logins for `key` are currently allowed. */
  async loginCheck(key: string): Promise<{ allowed: boolean; retryAfterSec: number }> {
    const r = await call("loginCheck", { key });
    return { allowed: Boolean(r.allowed), retryAfterSec: Number(r.retryAfterSec) || 0 };
  },

  /** Records a failed login attempt for `key`. */
  async loginFail(key: string): Promise<void> {
    await call("loginFail", { key });
  },

  /** Clears the failed-attempt counter for `key` (call on success). */
  async loginReset(key: string): Promise<void> {
    await call("loginReset", { key });
  },
};

export default db;
