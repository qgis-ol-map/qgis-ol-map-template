const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const CACHEABLE_LAYER_TYPES = new Set(["xyz", "wms-tiles", "wmts"]);

type PwaCacheConfig = {
  enabled?: boolean;
  maxAgeSeconds?: number;
  maxEntries?: number;
  maxZoom?: number;
};

type LayerNode = {
  type?: string;
  url?: string;
  pwaCache?: PwaCacheConfig;
  layers?: Record<string, LayerNode> | LayerNode[];
};

type LayerTree = Record<string, LayerNode> | LayerNode[] | undefined;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slug = (value: string) =>
  value
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const integerRangePattern = (max: number): string => {
  if (!Number.isInteger(max) || max < 0) {
    return "\\d+";
  }
  if (max <= 9) {
    return `[0-${max}]`;
  }
  if (max > 99) {
    return "\\d+";
  }

  const tens = Math.floor(max / 10);
  const ones = max % 10;
  const parts = ["[0-9]"];
  if (tens >= 2) {
    parts.push("1[0-9]");
  }
  if (tens >= 3) {
    parts.push(`[2-${tens - 1}][0-9]`);
  }
  if (tens === 1) {
    parts.push(ones === 9 ? "1[0-9]" : `1[0-${ones}]`);
  } else {
    parts.push(ones === 9 ? `${tens}[0-9]` : `${tens}[0-${ones}]`);
  }
  return `(?:${parts.join("|")})`;
};

const decodedPathname = (url: URL) => decodeURIComponent(url.pathname);

const urlTemplateToPattern = (urlString: string, maxZoom?: number): RegExp => {
  const parsed = new URL(urlString);
  const base = `${parsed.origin}${decodedPathname(parsed)}`;
  const placeholder = /\{([zxy])\}/gi;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = placeholder.exec(base)) !== null) {
    result += escapeRegExp(base.slice(lastIndex, match.index));
    const letter = match[1].toLowerCase();
    if (letter === "z" && maxZoom !== undefined) {
      result += integerRangePattern(maxZoom);
    } else {
      result += "\\d+";
    }
    lastIndex = match.index + match[0].length;
  }
  result += escapeRegExp(base.slice(lastIndex));
  return new RegExp(`^${result}`, "i");
};

const cacheNameFromUrl = (urlString: string) => {
  const parsed = new URL(urlString);
  const pathSlug = slug(decodedPathname(parsed).replace(/\{[zxy]\}/gi, ""));
  const hostSlug = slug(parsed.hostname);
  return pathSlug ? `${hostSlug}-${pathSlug}` : hostSlug;
};

export const flattenLayerConfigs = (layers: LayerTree): LayerNode[] => {
  if (!layers) {
    return [];
  }

  const entries = Array.isArray(layers) ? layers : Object.values(layers);
  const flattened: LayerNode[] = [];
  for (const layer of entries) {
    if (layer.type === "group") {
      flattened.push(...flattenLayerConfigs(layer.layers));
      continue;
    }
    flattened.push(layer);
  }
  return flattened;
};

export const runtimeCachingFromLayers = (flatLayers: LayerNode[]) => {
  const rules = [];
  for (const layer of flatLayers) {
    if (!CACHEABLE_LAYER_TYPES.has(layer.type ?? "")) {
      continue;
    }
    if (typeof layer.url !== "string") {
      continue;
    }

    let parsed: URL;
    try {
      parsed = new URL(layer.url);
    } catch {
      continue;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      continue;
    }

    const pwaCache = layer.pwaCache;
    if (pwaCache?.enabled === false) {
      continue;
    }

    const expiration: { maxAgeSeconds: number; maxEntries?: number } = {
      maxAgeSeconds: pwaCache?.maxAgeSeconds ?? THIRTY_DAYS_SECONDS,
    };
    if (pwaCache?.maxEntries !== undefined) {
      expiration.maxEntries = pwaCache.maxEntries;
    }

    rules.push({
      urlPattern: urlTemplateToPattern(layer.url, pwaCache?.maxZoom),
      handler: "CacheFirst" as const,
      options: {
        cacheName: cacheNameFromUrl(layer.url),
        expiration,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    });
  }
  return rules;
};
