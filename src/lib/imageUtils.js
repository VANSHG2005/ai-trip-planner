// Domains that reliably 404 or ERR_NAME_NOT_RESOLVED — never try these
export const BLOCKED_DOMAINS = [
  'tripadvisor.com', 'media-cdn.tripadvisor.com',
  'dishoom.com', 'static.dishoom.com',
  'pointahotels.com', 'www.pointahotels.com',
  'citizenm.com', 'images.citizenm.com',
  'booking.com', 'agoda.com', 'expedia.com', 'hotels.com',
  'marriott.com', 'hilton.com', 'ihg.com', 'accorhotels.com',
  'wikipedia.org', 'wikimedia.org', 'upload.wikimedia.org',
  'example.com', 'placeholder.com', 'lorempixel.com',
]

export function isBlockedUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return true
  try {
    const { hostname } = new URL(url)
    return BLOCKED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
  } catch { return true }
}

// Only these domains are actually reliable
export function isSafeUrl(url) {
  if (!url || !url.startsWith('https://')) return false
  try {
    const { hostname } = new URL(url)
    return ['images.unsplash.com', 'plus.unsplash.com', 'lh3.googleusercontent.com'].includes(hostname)
  } catch { return false }
}
