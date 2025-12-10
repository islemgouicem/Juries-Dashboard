import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

const JudgeIcon: React.FC = () => (
  <div className="w-16 h-16 rounded-full bg-[#6B5B7B]/60 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="14" r="5" stroke="#F5A623" strokeWidth="3" fill="none" />
      <path d="M 12 30 C 12 30 12 23 20 23 C 28 23 28 30 28 30" stroke="#F5A623" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 12 30 L 28 30" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
      <circle cx="10" cy="15" r="4" stroke="#F5A623" strokeWidth="3" fill="none" />
      <path d="M 5 28 C 5 28 5 23 10 23 C 12 23 13 24 13 25" stroke="#F5A623" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="15" r="4" stroke="#F5A623" strokeWidth="3" fill="none" />
      <path d="M 27 25 C 27 24 28 23 30 23 C 35 23 35 28 35 28" stroke="#F5A623" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error signing in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="inline-block relative mb-4">
          <img src="/LOGO.png" alt="Eunoia" className="h-16 w-auto mx-auto" />
        </div>
        <div className="mb-2">
          <img src="/Judges.png" alt="Judges Evaluation Portal" className="h-8 w-auto mx-auto" />
        </div>
      </div>

      <Card className="w-full bg-[rgba(67,8,112,0.3)] border backdrop-blur-md rounded-2xl"
        style={{
          maxWidth: "650px",
          border: "1px solid rgba(245, 166, 35, 0.25)",
          boxShadow: "0 0 80px 20px rgba(139, 79, 179, 0.4), 0 0 120px 40px rgba(124, 58, 237, 0.2)"
        }}>
        <CardHeader className="p-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <JudgeIcon />
            <CardTitle className="text-2xl text-white font-light">Judge Login</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleLogin} className="space-y-7">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-normal text-white">
                Email <span className="text-[#FC6D9F]">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border border-[#8B4FB3]/60 text-white placeholder:text-gray-500
                  focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#F5A623]
                  rounded-lg h-[48px] px-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-normal text-white">
                Password <span className="text-[#FC6D9F]">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="bg-transparent border border-[#8B4FB3]/60 text-white placeholder:text-gray-500
                  focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#F5A623]
                  rounded-lg h-[48px] px-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-[48px] text-base font-medium mt-4
                bg-gradient-to-b from-[#F5A623] to-[#D4941A]
                text-[#430870] hover:from-[#F5A623]/90 hover:to-[#D4941A]/90 rounded-lg shadow-lg"
              disabled={submitting}
            >
              {submitting ? "Authenticating..." : <>Continue <span className="ml-2">→</span></>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;