import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

const JudgeIcon: React.FC = () => (
  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="14" r="5" stroke="#ff0006" strokeWidth="3" fill="none" />
      <path d="M 12 30 C 12 30 12 23 20 23 C 28 23 28 30 28 30" stroke="#ff0006" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 12 30 L 28 30" stroke="#ff0006" strokeWidth="3" strokeLinecap="round" />
      <circle cx="10" cy="15" r="4" stroke="#ff0006" strokeWidth="3" fill="none" />
      <path d="M 5 28 C 5 28 5 23 10 23 C 12 23 13 24 13 25" stroke="#ff0006" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="15" r="4" stroke="#ff0006" strokeWidth="3" fill="none" />
      <path d="M 27 25 C 27 24 28 23 30 23 C 35 23 35 28 35 28" stroke="#ff0006" strokeWidth="3" fill="none" strokeLinecap="round" />
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
    <div className="mobai-login-bg flex flex-col min-h-screen items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-4 mb-3">
          <img src="/mobai_logo_1.png" alt="Mob AI" className="h-14 w-auto" />
          <div className="h-8 w-px bg-white/15" />
          <img src="/snt_logo.png" alt="SNT" className="h-10 w-auto opacity-90" />
        </div>
        <div className="mb-2">
          <div className="text-xl sm:text-2xl font-semibold tracking-[0.2em] mobai-text-gradient">
            JURY EVALUATION PORTAL
          </div>
        </div>
        <span className="mobai-chip">Jury Access</span>
      </div>

      <Card className="w-full mobai-card mobai-card-soft" style={{ maxWidth: "620px" }}>
        <CardHeader className="p-10 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <JudgeIcon />
            <div>
              <CardTitle className="text-3xl text-white font-light">Judge Login</CardTitle>
              <p className="text-sm text-white/60 mt-1">Secure access to Mob AI evaluations</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-normal text-white/80">
                Email <span className="text-[#ff6e6e]">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="mobai-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-normal text-white/80">
                Password <span className="text-[#ff6e6e]">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="mobai-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-[50px] text-base mt-2 mobai-button" disabled={submitting}>
              {submitting ? "Authenticating..." : <>Continue <span className="ml-2">→</span></>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;