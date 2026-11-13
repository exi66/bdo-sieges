import type { UserMarker } from "@/types/map"
import { parseMarkers } from "@/lib/map/markers"

/**
 * Код обмена картой.
 * v2: "v2." + base64url(deflate-raw(JSON)) — заметно короче.
 * v1 (устаревший): base64(encodeURIComponent(JSON)) — поддерживается при импорте.
 */
const V2_PREFIX = "v2."

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0))
}

async function pipe(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream
): Promise<Uint8Array> {
  const response = new Response(new Blob([bytes]).stream().pipeThrough(stream))
  return new Uint8Array(await response.arrayBuffer())
}

export async function encodeShareCode(markers: UserMarker[]): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(markers))
  const compressed = await pipe(json, new CompressionStream("deflate-raw"))
  return V2_PREFIX + bytesToBase64Url(compressed)
}

/** Возвращает маркеры или null, если код повреждён или данные некорректны. */
export async function decodeShareCode(
  code: string
): Promise<UserMarker[] | null> {
  try {
    const trimmed = code.trim()
    let json: string

    if (trimmed.startsWith(V2_PREFIX)) {
      const bytes = base64UrlToBytes(trimmed.slice(V2_PREFIX.length))
      const raw = await pipe(bytes, new DecompressionStream("deflate-raw"))
      json = new TextDecoder().decode(raw)
    } else {
      json = decodeURIComponent(atob(trimmed))
    }

    return parseMarkers(JSON.parse(json))
  } catch {
    return null
  }
}
