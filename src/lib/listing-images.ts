function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

export function vehiclePhotoPlaceholder(category: string, details: Record<string, string> = {}) {
  const identity = [details.year, details.make, details.model].map(value => value?.trim()).filter(Boolean).join(" ") || category;
  const safeIdentity = escapeXml(identity.slice(0, 60));
  const safeCategory = escapeXml(category.slice(0, 30));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900"><rect width="1400" height="900" fill="#123c2b"/><circle cx="1180" cy="130" r="280" fill="#d8e66a" opacity=".12"/><circle cx="170" cy="780" r="330" fill="#f4f0e6" opacity=".06"/><g fill="none" stroke="#d8e66a" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".9"><path d="M360 505h680l-80-155c-25-48-62-72-112-72H572c-45 0-80 22-107 65l-105 162Z"/><path d="M330 505h740v135H330z"/><circle cx="485" cy="650" r="73" fill="#123c2b"/><circle cx="915" cy="650" r="73" fill="#123c2b"/></g><text x="700" y="155" text-anchor="middle" fill="#f4f0e6" font-family="Arial, sans-serif" font-size="34" letter-spacing="8">VEHICLE PHOTO NEEDED</text><text x="700" y="770" text-anchor="middle" fill="#fff" font-family="Georgia, serif" font-size="58">${safeIdentity}</text><text x="700" y="830" text-anchor="middle" fill="#d8e66a" font-family="Arial, sans-serif" font-size="24" letter-spacing="5">${safeCategory.toUpperCase()} · NOT A PHOTO OF THE VEHICLE</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveListingPhotos(category: string, photoUrls: string[], details: Record<string, string>) {
  if (photoUrls.length) return { photoUrls, details: { ...details, _photoSource: "OWNER" } };
  return { photoUrls: [vehiclePhotoPlaceholder(category, details)], details: { ...details, _photoSource: "VAYRO_PLACEHOLDER" } };
}

export function isRepresentative(details: unknown) {
  if (!details || typeof details !== "object") return false;
  const source = (details as Record<string, unknown>)._photoSource;
  return source === "VAYRO_REPRESENTATIVE" || source === "VAYRO_PLACEHOLDER";
}
