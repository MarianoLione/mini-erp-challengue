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

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(await mensajeError(response));
  }
  return (await response.json()) as T;
}
