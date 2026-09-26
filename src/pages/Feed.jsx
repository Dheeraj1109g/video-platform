import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Feed() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/videos")
      .then((res) => setVideos(res.data.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", padding: "0 16px" }}>
      <h2>Videos</h2>
      <Link to="/upload">Upload New Video</Link>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        {videos.map((video) => (
          <div key={video.id} className="video-card">
            <Link to={`/video/${video.id}`}>
              <h3>{video.title}</h3>
            </Link>
            <p>{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;