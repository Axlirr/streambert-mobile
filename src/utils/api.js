import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

// ── TMDB metadata language ────────────────────────────────────────────────────
let currentLang = "en-US";

if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  AsyncStorage.getItem("streambert_tmdbLang").then(lang => {
    if (lang) {
      try {
        currentLang = JSON.parse(lang);
      } catch {}
    }
  }).catch(()=>{});
}

export const setTmdbLanguage = async (lang) => {
  currentLang = lang;
  await AsyncStorage.setItem("streambert_tmdbLang", JSON.stringify(lang));
  clearTmdbCache();
};

function withLanguage(path) {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}language=${currentLang}`;
}

export const imgUrl = (path, size = "w500") =>
  path ? `${IMG_BASE}/${size}${path}` : null;

let _onAuthError = null;
let _onUnreachable = null;
export const setApiErrorHandlers = (onAuth, onUnreachable) => {
  _onAuthError = onAuth;
  _onUnreachable = onUnreachable;
};

const _tmdbCache = new Map();
const TMDB_CACHE_TTL = 5 * 60 * 1000;

export function clearTmdbCache() {
  _tmdbCache.clear();
  AsyncStorage.removeItem("streambert_trendingCache").catch(()=>{});
}

let _inflight = 0;
const MAX_INFLIGHT = 4;
const _waiters = [];

function _acquireSlot() {
  if (_inflight < MAX_INFLIGHT) {
    _inflight++;
    return Promise.resolve();
  }
  return new Promise((resolve) => _waiters.push(resolve));
}

function _releaseSlot() {
  _inflight--;
  if (_waiters.length > 0) {
    _inflight++;
    _waiters.shift()();
  }
}

const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTk1NGZkYjVkODRlZWRjMGIzZDEzMWJlMjNlZWNjNSIsIm5iZiI6MTc3OTM0OTY2My41ODcwMDAxLCJzdWIiOiI2YTBlYjg5ZjRlZDAxNzZmODEzMGM3YjMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2MaG-WRUVGh5scFA1zSGKtkrPNjDCKWYmHdbK56PbOw";

export const tmdbFetch = async (path, apiKey = HARDCODED_TOKEN) => {
  const localizedPath = withLanguage(path);
  const cacheKey = `${apiKey}|${localizedPath}`;
  const cached = _tmdbCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  await _acquireSlot();

  let res;
  try {
    res = await fetch(`${TMDB_BASE}${localizedPath}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch {
    _releaseSlot();
    _onUnreachable?.();
    throw new Error("TMDB unreachable");
  }

  _releaseSlot();

  if (res.status === 401 || res.status === 403) {
    _onAuthError?.();
    throw new Error(`TMDB ${res.status}`);
  }

  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json();
  _tmdbCache.set(cacheKey, { data, expiresAt: Date.now() + TMDB_CACHE_TTL });

  if (_tmdbCache.size > 80) {
    const now = Date.now();
    for (const [k, v] of _tmdbCache) {
      if (now >= v.expiresAt) _tmdbCache.delete(k);
    }
  }

  return data;
};

export const getSourceUrl = (source, type, id, season, episode) => {
  if (source === "superembed") {
    if (type === "movie") return `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
    return `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
  }
  // Default to vidsrc.cc
  if (type === "movie") return `https://vidsrc.cc/v2/embed/movie/${id}`;
  return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
};
