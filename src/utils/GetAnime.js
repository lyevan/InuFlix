import axios from "axios";

const searchAnime = async (query) => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/${query}`
  );
  return res.data.results;
};

const getAnimeInfo = async (id) => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/info/${id}`
  );
  return res.data;
};

const getTrendingAnime = async () => {
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/meta/anilist/trending?perPage=20`
  );
  return res.data.results;
};

const watchAnime = async (id) => {
  const anime = {
    subtitle: null,
    watchUrl: "",
  };
  const res = await axios.get(
    `https://anime-ten-nu.vercel.app/anime/zoro/watch/${id}server=${selectedServer}`
  );
  const m3u8Url = res.data.sources[0].url;
  const engSub = res.data.subtitles.find((sub) => sub.lang === "English");
  setSubtitle(engSub ? engSub.url : null);
  anime.subtitle = engSub ? engSub.url : null;

  const proxy = await axios.get(`http://localhost:8080/proxy?url=${m3u8Url}`);

  const result = parseM3U8(proxy.data);
  setM3u8Result(result);
  const defaultUrl = result.length > 1 ? result[1].url : result[0].url;
  const selectedUrl =
    result.find((r) => r.resolution.split("x")[1] === resolution)?.url ||
    defaultUrl;

  anime.watchUrl = selectedUrl ? `http://localhost:8080${selectedUrl}` : "";
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
