"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Fetch or load user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error("verify error", err);
      }
    };
    fetchUser();
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-gray-900/80 backdrop-blur-lg shadow-md border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
        {/* Left - Logo + Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Serenity
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <Link
                href="/favorites"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                My Favorites
              </Link>
            </>
          )}
        </div>

        {/* Right - User / Auth Links */}
        <div className="relative flex items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-700 transition"
              >
                <span className="text-sm font-medium">
                  {user.name.split(" ")[0]}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/favorites"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Favorites
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
