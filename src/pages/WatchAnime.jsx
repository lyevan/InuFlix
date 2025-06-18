import { useParams } from "react-router";
import VideoPlayer from "../components/VideoPlayer";

export default function WatchAnime() {
  const { id } = useParams();
  return <VideoPlayer key={id} />;
}
