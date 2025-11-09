"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import GlobalSearch from "./GlobalSearch";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { playSong } = usePlayer();
  const [userName, setUserName] = useState("Music Lover");
  const [featuredAlbums, setFeaturedAlbums] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // ✅ Mood states
  const [moodSongs, setMoodSongs] = useState([]);
  const [loadingMood, setLoadingMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // ✅ Mood mapping (each mood has an ID)
  const moodList = [
    { id: 1, name: "Happy", color: "from-yellow-400 via-orange-400 to-pink-400" },
    { id: 2, name: "Workout", color: "from-red-500 via-rose-500 to-orange-500" },
    { id: 3, name: "Bollywood", color: "from-amber-500 via-pink-400 to-rose-500" },
    { id: 4, name: "Lofi", color: "from-indigo-500 via-purple-500 to-cyan-500" },
    { id: 5, name: "English", color: "from-emerald-400 via-cyan-400 to-blue-400" },
    { id: 6, name: "Romantic", color: "from-pink-500 via-rose-400 to-red-400" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUser(token);
    fetchAlbums();
    fetchRecommendations(token);

    // ✅ Check if mood is passed in URL (like /dashboard?mood=3)
    const params = new URLSearchParams(window.location.search);
    const moodId = params.get("mood");
    if (moodId) {
      const mood = moodList.find((m) => m.id === Number(moodId));
      if (mood) handleMoodClick(mood.id, mood.name);
    }
  }, [router]);

  // ✅ Fetch user info
  const fetchUser = async (token) => {
    try {
      const res = await axios.get("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setUserName(res.data.user.name);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // ✅ Fetch featured albums
  const fetchAlbums = async () => {
    try {
      const res = await axios.get(`/api/serenity/albums?query=Top%20Hits`);
      setFeaturedAlbums(res.data.data.results.slice(0, 6));
    } catch (err) {
      console.error("Error fetching albums:", err);
    }
  };

  // 🎯 Fetch songs based on user preferences
  const fetchRecommendations = async (token) => {
    setLoadingRecs(true);
    try {
      const prefRes = await axios.get("/api/user/preferences", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { preferences } = prefRes.data;
      if (!preferences?.isSetupComplete) {
        router.push("/onboarding");
        return;
      }

      const queries = [
        ...(preferences.genres || []),
        ...(preferences.artists || []),
      ];
      if (queries.length === 0) return;

      const songRequests = queries
        .slice(0, 4)
        .map((q) =>
          axios.get(`/api/serenity/search?query=${encodeURIComponent(q)}`)
        );

      const responses = await Promise.all(songRequests);
      const allSongs = responses.flatMap(
        (res) => res.data.data?.songs?.results?.slice(0, 2) || []
      );

      setRecommendedSongs(allSongs);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  // ✅ Fetch songs by mood (sending numeric ID)
  const handleMoodClick = async (moodId, moodName) => {
    setLoadingMood(true);
    setMoodSongs([]);
    setSelectedMood(moodName);

    try {
      const res = await fetch("/api/serenity/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: Number(moodId) }),
      });

      const data = await res.json();
      console.log("🎵 Mood Data:", data);

      setMoodSongs(data.songs || data);

      // smooth scroll
      setTimeout(() => {
        document.querySelector("#mood-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (err) {
      console.error("Error fetching mood songs:", err);
    } finally {
      setLoadingMood(false);
    }
  };

  // ✅ Helper: Convert Spotify URI → Embed URL
  const getSpotifyEmbedUrl = (uri) => {
    if (!uri) return null;
    const trackId = uri.split(":").pop();
    return `https://open.spotify.com/embed/track/${trackId}`;
  };

  const selectedMoodData = moodList.find((m) => m.name === selectedMood);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="p-10 text-center md:text-left md:p-16">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent"
        >
          Welcome back, {userName} 👋
        </motion.h1>
        <p className="text-gray-400 mt-2 text-lg max-w-lg">
          Discover music tailored to your taste 🎵
        </p>
      </div>

      {/* 🎯 Personalized Recommendations */}
      <section className="px-10 md:px-16 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">
          🎯 Recommended for You
        </h2>

        {loadingRecs ? (
          <p className="text-gray-400">
            Loading personalized recommendations...
          </p>
        ) : recommendedSongs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendedSongs.map((song, i) => (
              <motion.div
                key={song.id || i}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                <img
                  src={song.image?.[1]?.url || song.image?.[0]?.url}
                  alt={song.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">
                    {song.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {song.primaryArtists || "Unknown Artist"}
                  </p>
                  <button
                    onClick={() => playSong(song)}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm transition-all"
                  >
                    🎵 Listen Song
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No personalized songs yet — go select your favorite genres and
            artists 🎶
          </p>
        )}
      </section>

      {/* ✅ Quick Mood Filters */}
      <div className="flex flex-wrap justify-center md:justify-start gap-3 px-10 md:px-16 mb-12">
        {moodList.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => handleMoodClick(id, name)}
            className={`px-6 py-2 rounded-full text-sm transition-all font-medium tracking-wide ${
              selectedMood === name
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "bg-gray-800 hover:bg-emerald-600/80 text-gray-300 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* 🎧 Shazam-style Mood-based Spotify Section */}
      {selectedMood && (
        <section
          id="mood-section"
          className={`relative min-h-[80vh] flex flex-col items-center justify-center px-6 sm:px-10 md:px-16 py-20 overflow-hidden`}
        >
          {/* Dynamic gradient background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 bg-gradient-to-br ${
              selectedMoodData?.color || "from-emerald-800 to-gray-900"
            } opacity-25 blur-3xl`}
          ></motion.div>

          {/* Glow overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,200,0.07),transparent_60%)] animate-pulse"></div>

          <div className="relative text-center mb-12 z-10">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,200,0.3)]"
            >
              {selectedMood} Vibes 🌙
            </motion.h2>
            <p className="text-gray-400 mt-3 text-base md:text-lg font-light">
              Curated by <span className="text-emerald-400 font-medium">Serenity AI</span> — let your mood decide the music ✨
            </p>
          </div>

          {loadingMood ? (
            <p className="text-gray-400 text-center mt-10 z-10">
              Fetching {selectedMood} songs...
            </p>
          ) : moodSongs.length > 0 ? (
            <div className="relative z-10 w-full flex flex-col items-center gap-12">
              {moodSongs.map((song, i) => {
                const trackId = song.uri?.split(":").pop();
                const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,255,180,0.1)] hover:shadow-[0_0_50px_rgba(0,255,200,0.25)] transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-2xl border border-emerald-500/10 rounded-3xl"></div>
                    <div className="relative z-10 p-6 flex flex-col gap-4">
                      <h3 className="text-2xl font-semibold text-white tracking-wide drop-shadow-[0_0_10px_rgba(0,255,200,0.2)]">
                        {song.song_name || "Untitled Track"}
                      </h3>
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-2xl shadow-[0_0_30px_rgba(0,255,150,0.1)] transition-all hover:shadow-[0_0_35px_rgba(0,255,200,0.3)]"
                      ></iframe>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-t from-emerald-400/10 to-transparent blur-2xl rounded-full"></div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-10 z-10">
              No songs found for {selectedMood} mood 😕
            </p>
          )}
        </section>
      )}

      {/* 🔥 Trending Albums */}
      <section className="px-10 md:px-16 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">
          🔥 Trending Albums
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {featuredAlbums.map((album, i) => (
            <Link
              key={album.id || i}
              href={`/albums/${encodeURIComponent(album.name)}`}
            >
              <motion.div
                key={album.id || i}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                <img
                  src={album.image?.[2]?.url || album.image?.[1]?.url}
                  alt={album.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">
                    {album.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {album.artists?.primary?.[0]?.name || "Unknown"}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* 🔍 Global Search Section */}
      <div className="px-10 md:px-16 space-y-20">
        <GlobalSearch />
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-20 pb-6 border-t border-gray-800 pt-6">
        Made with 💚 by Abhishek Kumar — Serenity
      </footer>
    </div>
  );
}
