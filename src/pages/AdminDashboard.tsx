import { ArrowUpDown, Check, Eye, EyeOff, FilePlus, TrendingUp, Trophy, UserPlus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Criteria, CriteriaScore, JuryType } from "../../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface CriteriaScoreDisplay {
  criteriaName: string;
  score: number;
  weight: number;
  comment?: string;
}

interface JudgeScore {
  judgeName: string;
  total: number;
  criteriaScores: CriteriaScoreDisplay[];
}

interface ProjectRanking {
  id: string;
  name: string;
  teamName: string;
  problematic: string;
  teamMembers: string[];
  themeId: string;
  presentationOrder?: number;
  judgeScores: JudgeScore[];
  totalScore: number;
  avgScore: number;
  numJudges: number;
}

type Theme = { id: string; name: string };

const JURY_TYPES: JuryType[] = ["AI", "MOBILE", "DESIGN", "PRESENTATION"];

const AddProjectForm: React.FC<{ onSuccess: () => void; themes: Theme[] }> = ({ onSuccess, themes }) => {
  const [teamName, setTeamName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [themeId, setThemeId] = useState("");
  const [presentationOrder, setPresentationOrder] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const formatThemeName = (name: string) => (name === "Main Problematique" ? "MOBAI" : name);

  useEffect(() => {
    if (!themeId && themes.length === 1) {
      setThemeId(themes[0].id);
    }
  }, [themes, themeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamLeader || !themeId) {
      setMessage("Team name, team leader, and theme are required.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const { error } = await supabase
        .from("projects_1")
        .insert({
          team_name: teamName.trim(),
          team_leader: teamLeader.trim(),
          theme_id: themeId,
          presentation_order: presentationOrder,
        });

      if (error) throw error;

      setMessage("Project added successfully!");
      setStatus("success");
      setTeamName("");
      setTeamLeader("");
      setThemeId("");
      setPresentationOrder(0);
      onSuccess();
    } catch (e: any) {
      console.error("Error adding project:", e);
      setMessage(`Error adding project: ${e.message || "Unknown error"}`);
      setStatus("error");
    } finally {
      if (status === "loading") setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const isSubmitting = status === "loading";
  const bgColor =
    status === "success"
      ? "bg-green-700/30 border-green-500/50"
      : status === "error"
        ? "bg-red-900/30 border-red-500/50"
        : "";
  const textColor =
    status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "";

  return (
    <Card className="bg-[#2d1b69]/40 border-[#C68313]/30">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-[#F5A623]" /> Add Project Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Team Leader"
            value={teamLeader}
            onChange={(e) => setTeamLeader(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <select
            className="w-full bg-transparent border border-[#8B4FB3]/60 text-white rounded px-3 py-2"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            disabled={isSubmitting || themes.length === 1}
          >
            <option value="" className="text-black">
              Select theme
            </option>
            {themes.map((t) => (
              <option key={t.id} value={t.id} className="text-black">
                {formatThemeName(t.name)}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Presentation order (e.g., 1, 2, 3)"
            value={presentationOrder}
            onChange={(e) => setPresentationOrder(parseInt(e.target.value || "0", 10))}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Button type="submit" disabled={isSubmitting} className="w-full bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]">
            {isSubmitting ? "Adding..." : "Add Project"}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${bgColor}`}>
            <p className={`text-sm ${textColor}`}>{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AddJudgeForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [juryType, setJuryType] = useState<JuryType | "">("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedEmail = email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName || !cleanedEmail || !password || !password2 || !juryType) {
      setMessage("Full name, email, password, and jury type are required.");
      setStatus("error");
      return;
    }
    if (!emailRegex.test(cleanedEmail)) {
      setMessage(`Please enter a valid email. Got: "${cleanedEmail}"`);
      setStatus("error");
      return;
    }
    if (password !== password2) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const { data: userData, error: authError } = await supabase.auth.signUp({
        email: cleanedEmail,
        password,
      });

      if (authError) throw authError;
      console.log("no auth errors")
      const newJudgeId = userData.user?.id;
      if (!newJudgeId) throw new Error("Auth succeeded but no user id.");

      const { error: profileError } = await supabase.from("profiles_1").insert({
        id: newJudgeId,
        full_name: fullName.trim(),
        email: cleanedEmail,
        is_admin: false,
        type: juryType,
      });
      if (profileError) throw profileError;
      
      setMessage(`Judge ${fullName} added successfully.`);
      setStatus("success");
      setFullName("");
      setEmail("");
      setPassword("");
      setPassword2("");
      setJuryType("");
      onSuccess();
    } catch (e: any) {
      console.error("Error adding judge:", e);
      setMessage(`Error adding judge: ${e?.message || "Unknown error"}`);
      setStatus("error");
    } finally {
      if (status === "loading") setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const isSubmitting = status === "loading";
  const bgColor =
    status === "success"
      ? "bg-green-700/30 border-green-500/50"
      : status === "error"
        ? "bg-red-900/30 border-red-500/50"
        : "";
  const textColor =
    status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "";

  return (
    <Card className="bg-[#2d1b69]/40 border-[#C68313]/30">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#F5A623]" /> Add Judge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Judge Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Password (min 8 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Confirm Password"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <div className="space-y-2 text-white text-sm">
            <div>Jury Type:</div>
            <select
              className="w-full bg-transparent border border-[#8B4FB3]/60 text-white rounded px-3 py-2"
              value={juryType}
              onChange={(e) => setJuryType(e.target.value as JuryType)}
              disabled={isSubmitting}
            >
              <option value="" className="text-black">Select type</option>
              {JURY_TYPES.map((t) => (
                <option key={t} value={t} className="text-black">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]">
            {isSubmitting ? "Adding..." : "Add Judge"}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${bgColor}`}>
            <p className={`text-sm ${textColor}`}>{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RankingsView: React.FC = () => {
  const [rankings, setRankings] = useState<ProjectRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
    const channel = supabase
      .channel("evaluations-rankings")
      .on("postgres_changes", { event: "*", schema: "public", table: "criteria_scores" }, fetchRankings)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects_1" }, fetchRankings)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data: projects } = await supabase.from("projects_1").select("*").order("presentation_order", { ascending: true });
      const { data: scores } = await supabase.from("criteria_scores").select("*");
      const { data: profiles } = await supabase.from("profiles_1").select("id, full_name");
      const { data: criteriaList } = await supabase.from("criterias").select("*").order("sort_order", { ascending: true });

      const judgesMap: Record<string, string> = {};
      profiles?.forEach((p: any) => {
        judgesMap[p.id] = p.full_name;
      });

      const criteriaMap: Record<string, Criteria> = {};
      (criteriaList || []).forEach((c: any) => {
        criteriaMap[c.id] = {
          id: c.id,
          name: c.name,
          type: c.type,
          description: c.description,
          weight: c.weight,
          maxScore: c.max_score,
          sortOrder: c.sort_order,
        };
      });

      const projectRankings: ProjectRanking[] = (projects || []).map((project: any) => {
        const projectScores = (scores || []).filter((s: any) => s.project_id === project.id);
        const scoresByJudge: Record<string, CriteriaScore[]> = {};
        projectScores.forEach((s: any) => {
          const row: CriteriaScore = {
            id: s.id,
            createdAt: s.created_at,
            judgeId: s.judge_id,
            projectId: s.project_id,
            criteriaId: s.criteria_id,
            score: s.score ?? 0,
            comment: s.comment,
          };
          scoresByJudge[row.judgeId] = scoresByJudge[row.judgeId] || [];
          scoresByJudge[row.judgeId].push(row);
        });

        const judgeScores: JudgeScore[] = Object.entries(scoresByJudge).map(([judgeId, rows]) => {
          const criteriaScores: CriteriaScoreDisplay[] = rows.map((r) => {
            const c = criteriaMap[r.criteriaId];
            return {
              criteriaName: c?.name || "Criteria",
              score: r.score,
              weight: c?.weight ?? 1,
              comment: r.comment ?? undefined,
            };
          });

          const total = criteriaScores.reduce((sum, cs) => sum + cs.score * cs.weight, 0);
          return {
            judgeName: judgesMap[judgeId] || "Unknown Judge",
            total,
            criteriaScores,
          };
        });

        const totalScore = judgeScores.reduce((sum, js) => sum + js.total, 0);
        const avgScore = judgeScores.length > 0 ? totalScore / judgeScores.length : 0;
        const numJudges = judgeScores.length;

        return {
          id: project.id,
          name: project.name,
          teamName: project.team_name,
          problematic: project.problematic,
          teamMembers: project.team_members || [],
          themeId: project.theme_id,
          presentationOrder: project.presentation_order,
          judgeScores,
          totalScore,
          avgScore,
          numJudges,
        };
      });

      projectRankings.sort((a, b) => {
        if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
        return (a.presentationOrder ?? 0) - (b.presentationOrder ?? 0);
      });
      setRankings(projectRankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-3xl">🥉</span>;
    return <span className="text-2xl text-[#C68313] font-bold">#{rank}</span>;
  };

  if (loading) {
    return <div className="text-center text-white py-12">Loading rankings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-[#F5A623] flex items-center gap-3">
          <Trophy className="w-8 h-8" /> Project Rankings
        </h2>
        <div className="text-white text-sm">
          <span className="text-gray-400">Total Projects:</span> {rankings.length}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#F5A623]">
          <ArrowUpDown className="w-5 h-5" />
          <h3 className="text-2xl font-semibold">Overall</h3>
        </div>
        {rankings.map((project, index) => (
          <Card
            key={project.id}
            className={`bg-[#2d1b69]/30 border transition-all duration-300 ${index < 3 ? "border-[#FFD700]/30 hover:border-[#FFD700]/50" : "border-[#C68313]/20 hover:border-[#C68313]/50"
              }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 flex justify-center">{getMedalIcon(index + 1)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-[#C68313]">{project.teamName}</h3>
                      {project.numJudges === 0 && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Not Evaluated</span>
                      )}
                    </div>
                    <p className="text-white font-medium">{project.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{project.teamMembers?.join(", ")}</p>
                    <p className="text-xs text-gray-500 mt-1">Order: {project.presentationOrder ?? 0}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-[#F5A623]">{project.avgScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">pts</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {project.numJudges} {project.numJudges === 1 ? "evaluation" : "evaluations"}
                    </div>
                  </div>

                  <Button
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                    className="bg-[#2d1b69]/60 hover:bg-[#2d1b69]/80 text-white p-2"
                  >
                    {expandedProject === project.id ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {expandedProject === project.id && (
                <div className="mt-6 pt-6 border-t border-[#C68313]/20 space-y-3">
                  <h4 className="text-white font-semibold mb-2">Evaluations by Judge</h4>
                  {project.judgeScores.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No evaluations yet</p>
                  ) : (
                    project.judgeScores.map((score, idx) => (
                      <div key={idx} className="bg-[#1a0b2e]/50 rounded-lg p-4 border border-[#C68313]/10 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white">{score.judgeName}</div>
                            <div className="text-xs text-gray-400">Total {score.total.toFixed(1)} pts</div>
                          </div>
                          <div className="text-xl font-bold text-[#F5A623]">{score.total.toFixed(1)} pts</div>
                        </div>

                        <div className="text-sm text-gray-300 space-y-1">
                          {score.criteriaScores.map((c, cIdx) => (
                            <div key={cIdx}>
                              <span className="text-gray-400">{c.criteriaName}:</span> {c.score} × {c.weight}
                              {c.comment ? <span className="text-gray-500"> — {c.comment}</span> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, judgeProfile } = useAuth();
  const [activeView, setActiveView] = useState<"rankings" | "manage">("rankings");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("themes_1").select("*").order("sort_order").then(({ data }) => setThemes((data as Theme[]) || []));
    supabase.from("projects_1").select("*").order("presentation_order").then(({ data }) => setProjects(data || []));
  }, []);

  const updateOrder = async (projectId: string, order: number) => {
    await supabase.from("projects_1").update({ presentation_order: order }).eq("id", projectId);
    const { data } = await supabase.from("projects_1").select("*").order("presentation_order");
    setProjects(data || []);
  };

  const orderedProjects = useMemo(() => {
    return (projects || []).slice().sort((a: any, b: any) => (a.presentation_order ?? 0) - (b.presentation_order ?? 0));
  }, [projects]);

  return (
    <div className="p-6 md:p-12 pt-32 max-w-7xl mx-auto w-full min-h-screen">
      <div className="fixed top-0 left-0 right-0 mobai-topbar z-50">
        <div className="flex justify-between items-center py-5 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/mobai_logo_1.png" alt="Mob AI" className="h-10 w-auto" />
            <span className="mobai-chip hidden sm:inline-flex">Admin</span>
          </div>
          <div className="text-white text-right">
            <p className="text-lg font-light">
              Welcome, <span className="font-normal text-white">{judgeProfile?.name || "Admin"}</span>
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="mobai-button-outline px-4 py-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif text-[#F5A623]">Admin Panel</h1>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          className="text-white border border-[#F5A623]/40 hover:bg-[#F5A623]/10 bg-[#2d1b69]/40"
        >
          <Check className="w-4 h-4 mr-2" /> Judge Dashboard
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <Button
          onClick={() => setActiveView("rankings")}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 ${activeView === "rankings"
            ? "bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]"
            : "bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60"
            }`}
        >
          <Trophy className="w-5 h-5" />
          Rankings
        </Button>
        <Button
          onClick={() => setActiveView("manage")}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 ${activeView === "manage"
            ? "bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]"
            : "bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60"
            }`}
        >
          <TrendingUp className="w-5 h-5" />
          Manage
        </Button>
      </div>

      {activeView === "rankings" ? (
        <RankingsView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AddJudgeForm onSuccess={() => { }} />
          <AddProjectForm onSuccess={() => { }} themes={themes} />
        </div>
      )}

      <div className="mt-12 space-y-6">
        <h3 className="text-2xl text-[#F5A623]">Presentation Order</h3>
        <Card className="bg-[#2d1b69]/30 border-[#C68313]/20">
          <CardContent className="p-4 space-y-3">
            {orderedProjects.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 text-white">
                <Input
                  type="number"
                  className="w-20 bg-transparent border-[#C68313]/40"
                  value={p.presentation_order ?? 0}
                  onChange={(e) => updateOrder(p.id, parseInt(e.target.value || "0", 10))}
                />
                <span>{p.team_name} — {p.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Logged in as: <span className="text-gray-300">{judgeProfile?.email}</span> (Admin:{" "}
          <span className={`font-medium ${judgeProfile?.isAdmin ? "text-green-400" : "text-red-400"}`}>
            {judgeProfile?.isAdmin ? "TRUE" : "FALSE"}
          </span>
          )
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;