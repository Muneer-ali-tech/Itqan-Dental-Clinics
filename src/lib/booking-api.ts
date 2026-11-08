/* Browser-side client for the booking sender API (same-origin /api).
 * The browser never sees TABAH_EXEC_URL or TABAH_INGEST_SECRET — the server signs. */

export type Consent = { service: boolean; followup: boolean; review: boolean };

export type StartInput = {
  name: string;
  email: string;
  phone: string; // "9665XXXXXXXX" digits, country code included (server adds +)
  consent: Consent;
};

export type CompleteInput = { date: string; time: string };

export type BookingApiError = { code: string; fields?: Record<string, string> };

export type BookingOutcome = {
  sent?: boolean;
  accepted?: boolean;
  duplicate?: boolean;
  unconfirmed?: boolean;
  conflict?: boolean;
  locked?: boolean;
  stage?: string; // 'create' | 'complete'
  event?: string; // 'create' | 'complete'
  reference?: string | null;
  status?: string | null;
  version?: number;
  reason?: string; // NO_FOLLOWUP_CONSENT
  error?: BookingApiError;
};

async function call(path: string, body?: unknown): Promise<BookingOutcome> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw { code: "NETWORK" } as BookingApiError;
  }
  let data: BookingOutcome & { error?: BookingApiError } = {};
  try {
    data = await res.json();
  } catch {
    throw { code: "BAD_RESPONSE" } as BookingApiError;
  }
  if (!res.ok) {
    const err = (data as { error?: BookingApiError }).error || { code: "HTTP_" + res.status };
    throw err as BookingApiError;
  }
  return data;
}

export const bookingApi = {
  start: (input: StartInput) => call("/api/booking/start", input),
  complete: (input: CompleteInput) => call("/api/booking/complete", input),
  retry: () => call("/api/booking/retry"),
  reset: () => call("/api/booking/reset"),
};
