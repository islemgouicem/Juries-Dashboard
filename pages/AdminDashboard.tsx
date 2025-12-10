import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { supabase } from "../lib/supabase";
import { useAuth } from "../src/context/AuthContext";
import { Check, UserPlus, FilePlus, Trophy, TrendingUp, Eye, EyeOff, ArrowUpDown } from "lucide-react";
import { DbEvaluation } from "../types";

interface JudgeScore {
  judgeName: string;
  base: number;
  bonus: number;
  penalties: number;
  bmc: number;
  total: number;
  comments: Record<string, string | undefined>;
}

interface ProjectRanking {
  id: string;
  name: string;
  teamName: string;
  problematic: string;
  teamMembers: string[];
  themeId: string;
  themeName?: string;
  presentationOrder?: number;
  judgeScores: JudgeScore[];
  totalScore: number;
  avgScore: number;
  numJudges: number;
}

type Theme = { id: string; name: string };

const computeTotals = (e: DbEvaluation) => {
  const base =
    (e.relevance_score ?? 0) * 2.5 +
    (e.innovation_score ?? 0) * 2 +
    (e.feasibility_score ?? 0) * 2 +
    (e.impact_score ?? 0) * 2 +
    (e.presentation_score ?? 0) * 1.5;
  const bonus = (e.bonus_data ?? 0) + (e.bonus_prototype ?? 0) + (e.bonus_qa ?? 0);
  const penalties = (e.penalty_time ?? 0) + (e.penalty_quality ?? 0);
  const total = base + (e.bmc_score ?? 0) + bonus + penalties;
  return { base, bonus, penalties, total };
};

const AddProjectForm: React.FC<{ onSuccess: () => void; themes: Theme[] }> = ({ onSuccess, themes }) => {
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [problematic, setProblematic] = useState("");
  const [teamMembersInput, setTeamMembersInput] = useState("");
  const [themeId, setThemeId] = useState("");
  const [presentationOrder, setPresentationOrder] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !teamName || !problematic || !teamMembersInput || !themeId) {
      setMessage("All project fields must be filled.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const teamMembersArray = teamMembersInput.split(",").map((m) => m.trim()).filter((m) => m.length > 0);

      const { error } = await supabase
        .from("projects_1")
        .insert({
          name: name.trim(),
          team_name: teamName.trim(),
          problematic: problematic.trim(),
          team_members: teamMembersArray,
          theme_id: themeId,
          presentation_order: presentationOrder,
        });

      if (error) throw error;

      setMessage("Project added successfully!");
      setStatus("success");
      setName("");
      setTeamName("");
      setProblematic("");
      setTeamMembersInput("");
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
            placeholder="Project Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Problematic / Theme"
            value={problematic}
            onChange={(e) => setProblematic(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <Input
            placeholder="Team Members (Comma-separated)"
            value={teamMembersInput}
            onChange={(e) => setTeamMembersInput(e.target.value)}
            disabled={isSubmitting}
            className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
          />
          <select
            className="w-full bg-transparent border border-[#8B4FB3]/60 text-white rounded px-3 py-2"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" className="text-black">
              Select theme
            </option>
            {themes.map((t) => (
              <option key={t.id} value={t.id} className="text-black">
                {t.name}
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

const AddJudgeForm: React.FC<{ onSuccess: () => void; themes: Theme[] }> = ({ onSuccess, themes }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggleTheme = (id: string) => {
    setSelectedThemeIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedEmail = email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName || !cleanedEmail || !password || !password2 || selectedThemeIds.length === 0) {
      setMessage("Full name, email, password, and at least one theme are required.");
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
      });
      if (profileError) throw profileError;

      if (selectedThemeIds.length) {
        const rows = selectedThemeIds.map((tid) => ({ jury_id: newJudgeId, theme_id: tid }));
        const { error: jtErr } = await supabase.from("jury_themes_1").insert(rows);
        if (jtErr) throw jtErr;
      }

      setMessage(`Judge ${fullName} added successfully.`);
      setStatus("success");
      setFullName("");
      setEmail("");
      setPassword("");
      setPassword2("");
      setSelectedThemeIds([]);
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
            <div>Select themes (multi):</div>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <label
                  key={t.id}
                  className={`px-3 py-2 rounded border cursor-pointer ${selectedThemeIds.includes(t.id)
                      ? "border-[#F5A623] text-[#F5A623]"
                      : "border-[#8B4FB3]/60 text-white"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedThemeIds.includes(t.id)}
                    onChange={() => toggleTheme(t.id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>
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
  const [themes, setThemes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
    const channel = supabase
      .channel("evaluations-rankings")
      .on("postgres_changes", { event: "*", schema: "public", table: "evaluations_1" }, fetchRankings)
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
      const { data: evaluations } = await supabase.from("evaluations_1").select("*");
      const { data: profiles } = await supabase.from("profiles_1").select("id, full_name");
      const { data: themeList } = await supabase.from("themes_1").select("id, name").order("sort_order", { ascending: true });

      const judgesMap: Record<string, string> = {};
      profiles?.forEach((p: any) => {
        judgesMap[p.id] = p.full_name;
      });

      const themeMap: Record<string, string> = {};
      themeList?.forEach((t: any) => {
        themeMap[t.id] = t.name;
      });
      setThemes(themeMap);

      const projectRankings: ProjectRanking[] = (projects || []).map((project: any) => {
        const projectEvals = (evaluations || []).filter((e: any) => e.project_id === project.id);
        const judgeScores: JudgeScore[] = projectEvals.map((evaluation: DbEvaluation) => {
          const t = computeTotals(evaluation);
          return {
            judgeName: judgesMap[evaluation.judge_id] || "Unknown Judge",
            base: t.base,
            bonus: t.bonus + (evaluation.bmc_score ?? 0),
            penalties: t.penalties,
            bmc: evaluation.bmc_score ?? 0,
            total: t.total,
            comments: {
              relevance: evaluation.relevance_comment ?? undefined,
              innovation: evaluation.innovation_comment ?? undefined,
              feasibility: evaluation.feasibility_comment ?? undefined,
              impact: evaluation.impact_comment ?? undefined,
              presentation: evaluation.presentation_comment ?? undefined,
              bmc: evaluation.bmc_comment ?? undefined,
              bonusData: evaluation.bonus_data_comment ?? undefined,
              bonusPrototype: evaluation.bonus_proto_comment ?? undefined,
              bonusQa: evaluation.bonus_qa_comment ?? undefined,
              penalty: evaluation.penalty_comment ?? undefined,
            },
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
          themeName: themeMap[project.theme_id],
          presentationOrder: project.presentation_order,
          judgeScores,
          totalScore,
          avgScore,
          numJudges,
        };
      });

      projectRankings.sort((a, b) => {
        if (a.themeName !== b.themeName) return (a.themeName || "").localeCompare(b.themeName || "");
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
          <Trophy className="w-8 h-8" /> Project Rankings by Theme
        </h2>
        <div className="text-white text-sm">
          <span className="text-gray-400">Total Projects:</span> {rankings.length}
        </div>
      </div>

      {Object.entries(
        rankings.reduce((acc: Record<string, ProjectRanking[]>, r) => {
          const key = r.themeName || "Other";
          acc[key] = acc[key] || [];
          acc[key].push(r);
          return acc;
        }, {})
      ).map(([theme, items]: [string, ProjectRanking[]]) => (
        <div key={theme} className="space-y-3">
          <div className="flex items-center gap-2 text-[#F5A623]">
            <ArrowUpDown className="w-5 h-5" />
            <h3 className="text-2xl font-semibold">{theme}</h3>
          </div>
          {items.map((project, index) => (
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
                      <div className="text-sm text-gray-400">/ 125</div>
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
                              <div className="text-xs text-gray-400">
                                Base {score.base.toFixed(1)} | BMC {score.bmc} | Bonus {score.bonus.toFixed(1)} | Penalties {score.penalties}
                              </div>
                            </div>
                            <div className="text-xl font-bold text-[#F5A623]">{score.total.toFixed(1)}/125</div>
                          </div>

                          <div className="text-sm text-gray-300 space-y-1">
                            {score.comments.relevance && <div><span className="text-gray-400">Relevance:</span> {score.comments.relevance}</div>}
                            {score.comments.innovation && <div><span className="text-gray-400">Innovation:</span> {score.comments.innovation}</div>}
                            {score.comments.feasibility && <div><span className="text-gray-400">Feasibility:</span> {score.comments.feasibility}</div>}
                            {score.comments.impact && <div><span className="text-gray-400">Impact:</span> {score.comments.impact}</div>}
                            {score.comments.presentation && <div><span className="text-gray-400">Presentation:</span> {score.comments.presentation}</div>}
                            {score.comments.bmc && <div><span className="text-gray-400">BMC:</span> {score.comments.bmc}</div>}
                            {score.comments.bonusData && <div><span className="text-gray-400">Bonus Data:</span> {score.comments.bonusData}</div>}
                            {score.comments.bonusPrototype && <div><span className="text-gray-400">Bonus Prototype:</span> {score.comments.bonusPrototype}</div>}
                            {score.comments.bonusQa && <div><span className="text-gray-400">Bonus Q&A:</span> {score.comments.bonusQa}</div>}
                            {score.comments.penalty && <div><span className="text-gray-400">Penalty:</span> {score.comments.penalty}</div>}
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
      ))}
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

  const groupedProjects = useMemo(() => {
    return (projects || []).reduce((acc: Record<string, any[]>, p: any) => {
      acc[p.theme_id] = acc[p.theme_id] || [];
      acc[p.theme_id].push(p);
      return acc;
    }, {});
  }, [projects]);

  return (
    <div className="p-6 md:p-12 pt-32 max-w-7xl mx-auto w-full min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-[#2B1055] z-50" style={{ borderBottom: "1px solid #F5A623" }}>
        <div className="flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto">
          <img src="/LOGO.png" alt="Eunoia" className="h-12 w-auto" />
          <div className="text-white text-right">
            <p className="text-xl font-light">
              Welcome, <span className="font-normal">{judgeProfile?.name || "Admin"}</span>
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="border border-slate-200 px-4 py-2 rounded hover:bg-slate-50"
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
          <AddJudgeForm onSuccess={() => { }} themes={themes} />
          <AddProjectForm onSuccess={() => { }} themes={themes} />
        </div>
      )}

      <div className="mt-12 space-y-6">
        <h3 className="text-2xl text-[#F5A623]">Presentation Order (per theme)</h3>
        {Object.entries(groupedProjects).map(([themeId, items]: [string, any[]]) => (
          <Card key={themeId} className="bg-[#2d1b69]/30 border-[#C68313]/20">
            <CardContent className="p-4 space-y-3">
              <div className="text-white font-semibold">
                {themes.find((t) => t.id === themeId)?.name || "Theme"}
              </div>
              {items
                .sort((a: any, b: any) => (a.presentation_order ?? 0) - (b.presentation_order ?? 0))
                .map((p: any) => (
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
        ))}
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