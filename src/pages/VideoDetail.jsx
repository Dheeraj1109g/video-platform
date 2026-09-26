import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const loadData = () => {
    api.get(`/videos/${id}`).then((res) => setVideo(res.data.data));
    api.get(`/videos/${id}/comments`).then((res) => setComments(res.data.data));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/videos/${id}/comment`, { text });
      setText("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!video) return <p>Loading...</p>;

  return (
    <div>
      <h2>{video.title}</h2>
      <video src={video.cloudinary_url} controls width="500" />
      <p>{video.description}</p>

      <h3>Comments</h3>
      <form onSubmit={handleComment}>
        <input type="text" placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} required />
        <button type="submit">Post</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {comments.map((c) => (
        <p key={c.id}>{c.text}</p>
      ))}
    </div>
  );
}

export default VideoDetail;