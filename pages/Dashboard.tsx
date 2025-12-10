import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Search, LogOut, Settings, CheckCircle2 } from "lucide-react";
import { Project, DbEvaluation } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../src/context/AuthContext";

const adaptDbProject = (dbProject: any): Project => ({
  id: dbProject.id,
  name: dbProject.name,
  teamName: dbProject.team_name,
  problematic: dbProject.problematic,
  teamMembers: dbProject.team_members || [],
  themeId: dbProject.theme_id,
  presentationOrder: dbProject.presentation_order ?? 0,
  isActive: dbProject.is_active ?? true,
  status: "pending",
});

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
  return { total, base, bonus, penalties };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { judgeProfile, themeIds, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const judgeName = judgeProfile?.name || "Judge";
  const judgeId = judgeProfile?.id;
  const isAdmin = judgeProfile?.isAdmin || false;

  useEffect(() => {
    let channelProjects: any;
    let channelEvals: any;

    const fetchAllData = async () => {
      if (!judgeId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const projectQuery = supabase.from("projects_1").select("*").order("presentation_order", { ascending: true });
        const { data: dbProjects } = await projectQuery;

        const { data: myEvaluations } = await supabase
          .from("evaluations_1")
          .select("*")
          .eq("judge_id", judgeId);

        const evalMap = (myEvaluations || []).reduce((acc: any, e: DbEvaluation) => {
          acc[e.project_id] = computeTotals(e);
          return acc;
        }, {});

        const merged: Project[] = (dbProjects || [])
          .filter((p: any) => (isAdmin || themeIds.length === 0 ? true : themeIds.includes(p.theme_id)))
          .map((dbProject: any) => {
            const project = adaptDbProject(dbProject);
            if (evalMap[project.id]) {
              project.status = "completed";
              project.scores = {
                relevance: myEvaluations?.find((e: any) => e.project_id === project.id)?.relevance_score ?? 0,
                innovation: myEvaluations?.find((e: any) => e.project_id === project.id)?.innovation_score ?? 0,
                feasibility: myEvaluations?.find((e: any) => e.project_id === project.id)?.feasibility_score ?? 0,
                impact: myEvaluations?.find((e: any) => e.project_id === project.id)?.impact_score ?? 0,
                presentation: myEvaluations?.find((e: any) => e.project_id === project.id)?.presentation_score ?? 0,
                bmc: myEvaluations?.find((e: any) => e.project_id === project.id)?.bmc_score ?? 0,
                bonusData: myEvaluations?.find((e: any) => e.project_id === project.id)?.bonus_data ?? 0,
                bonusPrototype: myEvaluations?.find((e: any) => e.project_id === project.id)?.bonus_prototype ?? 0,
                bonusQa: myEvaluations?.find((e: any) => e.project_id === project.id)?.bonus_qa ?? 0,
                penaltyTime: myEvaluations?.find((e: any) => e.project_id === project.id)?.penalty_time ?? 0,
                penaltyQuality: myEvaluations?.find((e: any) => e.project_id === project.id)?.penalty_quality ?? 0,
              };
            }
            return project;
          })
          .sort((a, b) => {
            const aStatus = a.status === "pending" ? 0 : 1;
            const bStatus = b.status === "pending" ? 0 : 1;
            if (aStatus !== bStatus) return aStatus - bStatus;
            return (a.presentationOrder ?? 0) - (b.presentationOrder ?? 0);
          });

        setProjects(merged);
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    channelProjects = supabase
      .channel(`projects-${judgeId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects_1" }, fetchAllData)
      .subscribe();

    channelEvals = supabase
      .channel(`evals-${judgeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evaluations_1", filter: `judge_id=eq.${judgeId}` },
        fetchAllData
      )
      .subscribe();

    return () => {
      if (channelProjects) supabase.removeChannel(channelProjects);
      if (channelEvals) supabase.removeChannel(channelEvals);
    };
  }, [judgeId, themeIds, isAdmin]);

  const filteredAndSorted = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        project.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const status = project.status || "pending";
      const matchesTab = activeTab === "all" ? true : status === activeTab;
      return matchesSearch && matchesTab;
    });
    return filtered;
  }, [projects, searchQuery, activeTab]);

  const stats = {
    total: projects.length,
    pending: projects.filter((p) => (p.status || "pending") === "pending").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-[#430870]">
      <div className="fixed top-0 left-0 right-0 bg-[#2B1055] z-50 border-b border-[#F5A623]">
        <div className="flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto">
          <div>
            <img src="/LOGO.png" alt="Eunoia" className="h-12 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xl font-light text-white mr-2">
              Welcome, <span className="font-normal">{judgeName}</span>
            </p>
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                className="bg-[#C68313] hover:bg-[#D4941A] p-2 h-9 w-9 flex items-center justify-center text-[#2B1055] rounded-md"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={signOut}
              className="bg-destructive hover:bg-destructive/80 p-2 h-9 w-9 flex items-center justify-center rounded-md"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-28 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="my-24" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Total Projects" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Completed" value={stats.completed} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by team name, project title."
              className="pl-10 bg-transparent border-[#C68313]/30 text-white rounded-lg h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="All" />
            <TabButton active={activeTab === "pending"} onClick={() => setActiveTab("pending")} label="Pending" />
            <TabButton active={activeTab === "completed"} onClick={() => setActiveTab("completed")} label="Completed" />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-xl text-gray-300 py-12">Loading projects...</div>
        ) : filteredAndSorted.length > 0 ? (
          <div className="space-y-6">
            {filteredAndSorted.map((project) => {
              const isCompleted = project.status === "completed";
              return (
                <Card
                  key={project.id}
                  className={`transition-all duration-300 ${isCompleted
                      ? "bg-[#1a0b2e]/50 border-[#6b7280]/30"
                      : "bg-[#2d1b69]/30 border-[#C68313]/20 hover:border-[#C68313]/50"
                    }`}
                >
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-xl font-bold ${isCompleted ? "text-[#9ca3af] line-through" : "text-[#C68313]"
                            }`}
                        >
                          {project.teamName}
                        </h3>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                      <p className={`font-medium text-lg ${isCompleted ? "text-gray-400" : "text-white"}`}>
                        {project.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        <span className="text-gray-300 font-medium">Problematic:</span> {project.problematic}
                      </p>
                      <p className="text-gray-400 text-sm">
                        <span className="text-gray-300 font-medium">Team Members:</span>{" "}
                        {project.teamMembers.join(", ")}
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="gradient"
                        className={`rounded-lg px-6 shadow-[0_0_15px_rgba(198,131,19,0.3)] ${isCompleted ? "opacity-80" : ""
                          }`}
                        onClick={() => navigate(`/evaluate/${project.id}`)}
                      >
                        {isCompleted ? "Edit Evaluation" : "Evaluate Project"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">No projects found.</div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-[#2d1b69]/40 backdrop-blur-sm border border-[#C68313]/30 rounded-xl p-6 shadow-lg">
    <h3 className="text-lg font-medium text-white mb-2">{label}</h3>
    <p className="text-3xl font-bold text-[#C68313]">{value}</p>
  </div>
);

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <Button
    onClick={onClick}
    className={`rounded-lg px-6 ${active
        ? "bg-[#C68313] text-black hover:bg-[#C68313]/90"
        : "bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60"
      }`}
  >
    {label}
  </Button>
);

export default Dashboard;