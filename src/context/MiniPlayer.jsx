"use client";
import { motion } from "framer-motion";
import { usePlayer } from "./PlayerContext";

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, stopSong } = usePlayer();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 md:p-4 flex items-center justify-between z-50"
    >
      {/* Song Info */}
      <div className="flex items-center gap-3">
        <img
          src={currentSong?.image?.[1]?.url || "/default-song.jpg"}
          alt={currentSong?.name}
          className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover"
        />
        <div>
          <h4 className="font-semibold text-white text-sm md:text-base truncate w-32 md:w-48">
            {currentSong?.name}
          </h4>
          <p className="text-gray-400 text-xs md:text-sm truncate w-32 md:w-48">
            {currentSong?.artists?.primary?.map(a => a.name).join(", ") || "Unknown Artist"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={togglePlay}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-full text-sm md:text-base"
        >
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button
          onClick={stopSong}
          className="bg-gray-700 hover:bg-red-600 text-white px-3 py-2 rounded-full text-sm md:text-base"
        >
          ⏹ Stop
        </button>
      </div>
    </motion.div>
  );
}
