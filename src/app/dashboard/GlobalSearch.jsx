"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext"; // 👈 global player context
import MiniPlayer from "@/context/MiniPlayer";
export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    songs: [],
    albums: [],
    playlists: [],
  });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const { playSong } = usePlayer(); // 🎵 Global play handler

  // ✅ Fetch user's favorites on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchFavorites(token);
  }, []);

  const fetchFavorites = async (token) => {
    try {
      const res = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error("fetch favorites err", err);
    }
  };

  // 🔍 Universal search handler
  const searchAll = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/serenity/search?query=${encodeURIComponent(query)}`
      );
      const data = res.data.data;
      console.log("Search Response:", data);

      if (Array.isArray(data.results)) {
        setResults({
          songs: data.results || [],
          albums: [],
          playlists: [],
        });
      } else {
        setResults({
          songs: data.songs?.results || data.songs || [],
          albums: data.albums?.results || data.albums || [],
          playlists: data.playlists?.results || data.playlists || [],
        });
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🎵 Load trending songs by default
  useEffect(() => {
    const loadDefault = async () => {
      try {
        const res = await axios.get(`/api/serenity/search?query=trending`);
        const data = res.data.data;
        if (Array.isArray(data.results)) {
          setResults({
            songs: data.results || [],
            albums: [],
            playlists: [],
          });
        } else {
          setResults({
            songs: data.songs?.results || data.songs || [],
            albums: data.albums?.results || data.albums || [],
            playlists: data.playlists?.results || data.playlists || [],
          });
        }
      } catch (err) {
        console.error("Default search load error:", err);
      }
    };
    loadDefault();
  }, []);

  // ❤️ Add/Remove Favorites
  const toggleFavorite = async (song) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add favorites.");
      return;
    }

    const isFav = favorites.some((f) => f.id === song.id);
    setFavLoading(true);

    try {
      if (isFav) {
        await axios.delete(
          `/api/user/favorites?id=${encodeURIComponent(song.id)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites((prev) => prev.filter((f) => f.id !== song.id));
      } else {
        await axios.post(
          "/api/user/favorites",
          { song },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites((prev) => [...prev, song]);
      }
    } catch (err) {
      console.error("toggle favorite err", err);
    } finally {
      setFavLoading(false);
    }
  };

  const isFavorite = (songId) => favorites.some((f) => f.id === songId);

  return (
    <section className="mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
          🔍 Explore Music
        </h2>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <input
            type="text"
            placeholder="Search songs, albums or playlists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchAll()}
            className="border border-gray-700 bg-gray-900/70 text-white p-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 w-80"
          />
          <button
            onClick={searchAll}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-5 py-2 rounded-full hover:from-green-400 hover:to-emerald-500 transition-all"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-gray-400 text-center mt-10">Searching...</p>
      ) : (
        <div className="space-y-14">
          {/* 🎧 Songs Section */}
          {results.songs.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-emerald-400">
                🎧 Songs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.songs.slice(0, 10).map((song, i) => (
                  <motion.div
                    key={song.id || i}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-400/40 transition-all"
                  >
                    {/* ❤️ Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(song)}
                      disabled={favLoading}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                        isFavorite(song.id)
                          ? "bg-red-500 text-white"
                          : "bg-gray-700/70 text-gray-300 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {isFavorite(song.id) ? "❤️" : "🤍"}
                    </button>

                    {/* Song Image */}
                    <img
                      src={
                        song.image?.[1]?.url ||
                        song.image?.[0]?.url ||
                        "/default-song.jpg"
                      }
                      alt={song.name}
                      className="w-full h-48 object-cover"
                    />

                    <div className="p-3">
                      <h4 className="font-semibold truncate">
                        {song.name || song.title}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">
                        {song.artists?.primary
                          ?.map((a) => a.name)
                          .join(", ") ||
                          song.primaryArtists ||
                          "Unknown Artist"}
                      </p>

                      {/* 🎵 Listen Song Button */}
                      <button
                        onClick={() => playSong(song)}
                        className="mt-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-emerald-500 transition-all"
                      >
                        🎵 Listen Song
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 💿 Albums Section */}
          {results.albums.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-emerald-400">
                💿 Albums
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.albums.slice(0, 10).map((album, i) => (
                  <motion.div
                    key={album.id || i}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-400/40 transition-all cursor-pointer"
                  >
                    <img
                      src={
                        album.image?.[1]?.url ||
                        album.image?.[0]?.url ||
                        "/default-album.jpg"
                      }
                      alt={album.name || album.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="font-semibold truncate">
                        {album.name || album.title}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">
                        {album.artist ||
                          album.primaryArtists ||
                          "Unknown Artist"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 🎶 Playlists Section */}
          {results.playlists.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-emerald-400">
                🎶 Playlists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.playlists.slice(0, 10).map((pl, i) => (
                  <motion.div
                    key={pl.id || i}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-400/40 transition-all cursor-pointer"
                  >
                    <img
                      src={
                        pl.image?.[1]?.url ||
                        pl.image?.[0]?.url ||
                        "/default-playlist.jpg"
                      }
                      alt={pl.name || pl.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="font-semibold truncate">
                        {pl.name || pl.title}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">
                        {pl.language || "Mixed Languages"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !results.songs.length &&
            !results.albums.length &&
            !results.playlists.length && (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-lg">
                  Start typing to explore your favorite music 🎶
                </p>
              </div>
            )}
        </div>
      )}
    </section>
  );
}
