import axios from "axios";

const searchAnime = async (query) => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/${query}`
  );
  return res.data.results;
};

const getRandomAnime = async () => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/random`
  );
  return res.data;
};

const getAnimeInfo = async (id) => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/info/${id}`
  );
  return res.data;
};

const getTrendingAnime = async () => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/trending?perPage=10`
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
    `https://anime-ten-nu.vercel.app/anime/zoro/watch/${id}server=${selectedServer}`
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

export { searchAnime, getAnimeInfo, getTrendingAnime, watchAnime };
