import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import ThemeToggle from "../../components/ThemeToggle";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!fullName) {
      setError("Please enter full name");
      return;
    }
    if (!email) {
      setError("Please enter email");
      return;
    }
    if (!password) {
      setError("Please enter password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { fullName, email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.code === "ERR_NETWORK"
        ? "Cannot reach server. Make sure the backend is running."
        : err.response?.data?.error || err.response?.data?.message || "Signup failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-white dark:bg-slate-900 shadow-lg rounded-2xl p-8 w-96 border border-slate-200 dark:border-slate-700">

        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-white">
          Create Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 mt-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 mt-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 mt-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-500"
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-4">
          Already have an account?
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-2 border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 dark:border-amber-500 dark:text-amber-500"
        >
          Log In
        </button>

      </div>

    </div>
  );
};

export default SignUp;