import { API_BASE_URL } from "./config";

async function mensajeError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  } catch {
    // respuesta no JSON
  }

  return `Error ${response.status}`;
}

async function leerJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await mensajeError(response));
  }
  return (await response.json()) as T;
}

export async function getJson<T>(path: string): Promise<T> {
  return leerJson<T>(await fetch(`${API_BASE_URL}${path}`));
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return leerJson<T>(
    await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}
