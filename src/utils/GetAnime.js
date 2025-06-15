import axios from "axios";

const API_URL = "https://anime-ten-nu.vercel.app";

const searchAnime = async (query) => {
  const res = await axios.get(`${API_URL}/meta/anilist/${query}`);
  return res.data.results;
};

const getRandomAnime = async () => {
  const res = await axios.get(`${API_URL}/meta/anilist/random`);
  return res.data;
};

const getAnimeInfo = async (id) => {
  const res = await axios.get(
    `${API_URL}/meta/anilist/info/${id}?provider=animepahe`
  );
  return res.data;
};

const getTrendingAnime = async () => {
  const res = await axios.get(`${API_URL}/meta/anilist/trending?perPage=10`);
  return res.data.results;
};

const getPopularAnime = async (page = 1) => {
  const res = await axios.get(
    `${API_URL}/meta/anilist/popular?page=${page}&perPage=20`
  );
  return res.data.results;
};

const getAiringAnime = async (page = 1) => {
  const res = await axios.get(
    `${API_URL}/meta/anilist/airing-schedule?page=${page}&perPage=20&notYetAired=true`
  );
  return res.data.results;
};

const watchAnime = async (id, resolution, selectedServer) => {
  const anime = {
    subtitle: null,
    watchUrl: "",
    m3u8Result: null,
  };
  const res = await axios.get(
    `${API_URL}/anime/zoro/watch/${id}server=${selectedServer}`
  );
  const m3u8Url = res.data.sources[0].url;
  const engSub = res.data.subtitles.find((sub) => sub.lang === "English");

  anime.subtitle = engSub ? engSub.url : null;

  const proxy = await axios.get(`http://localhost:8080/proxy?url=${m3u8Url}`);

  const result = parseM3U8(proxy.data);
  anime.m3u8Result = result;
  const defaultUrl = result.length > 1 ? result[1].url : result[0].url;
  const selectedUrl =
    result.find((r) => r.resolution.split("x")[1] === resolution)?.url ||
    defaultUrl;

  anime.watchUrl = selectedUrl ? `http://localhost:8080${selectedUrl}` : "";

  return anime;
};

const getStreamUrl = async (id) => {
  try {
    const res = await axios.get(
      `${API_URL}/anime/animepahe/watch?episodeId=${id}`
    );

    // Optionally check if response is valid
    if (!res.data || !res.data.sources) {
      throw new Error("No sources found for this episode.");
    }

    console.log(res.data.sources);
    return res.data.sources; // return array of available stream sources
  } catch (error) {
    console.error("Failed to fetch stream URL:", error);
    return []; // return empty array on failure
  }
};

const parseM3U8 = (m3u8Text) => {
  const lines = m3u8Text.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
      const url = lines[i + 1];
      result.push({
        resolution: resolutionMatch ? resolutionMatch[1] : "Unknown",
        url: url.trim(),
      });
    }
  }

  return result;
};

export {
  searchAnime,
  getAnimeInfo,
  getTrendingAnime,
  getPopularAnime,
  watchAnime,
  getStreamUrl,
  getAiringAnime,
};
