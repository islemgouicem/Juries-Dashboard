import { CheckCircle2, LogOut, Search, Settings } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Criteria, CriteriaScore, Project } from "../../types";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const adaptDbProject = (dbProject: any): Project => ({
  id: dbProject.id,
  name: dbProject.name,
  teamName: dbProject.team_name,
  problematic: dbProject.problematic,
  teamMembers: dbProject.team_members || [],
  teamLeader: dbProject.team_leader ?? null,
  themeId: dbProject.theme_id,
  presentationOrder: dbProject.presentation_order ?? 0,
  isActive: dbProject.is_active ?? true,
  status: "pending",
});

const computeCriteriaTotal = (scores: CriteriaScore[], criteriaById: Record<string, Criteria>) => {
  return scores.reduce((sum, s) => {
    const c = criteriaById[s.criteriaId];
    const weight = c?.weight ?? 1;
    return sum + s.score * weight;
  }, 0);
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { judgeProfile, signOut } = useAuth();
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

        const { data: dbProjects } = await supabase
          .from("projects_1")
          .select("*")
          .order("presentation_order", { ascending: true });

        const { data: criteriaList } = await supabase
          .from("criterias")
          .select("*")
          .eq("type", judgeProfile?.type || "");

        const criteriaById: Record<string, Criteria> = {};
        (criteriaList || []).forEach((c: any) => {
          criteriaById[c.id] = {
            id: c.id,
            name: c.name,
            type: c.type,
            description: c.description,
            weight: c.weight,
            maxScore: c.max_score,
            sortOrder: c.sort_order,
          };
        });

        const { data: myScores } = await supabase
          .from("criteria_scores")
          .select("*")
          .eq("judge_id", judgeId);

        const scoresByProject: Record<string, CriteriaScore[]> = {};
        (myScores || []).forEach((s: any) => {
          const row: CriteriaScore = {
            id: s.id,
            createdAt: s.created_at,
            judgeId: s.judge_id,
            projectId: s.project_id,
            criteriaId: s.criteria_id,
            score: s.score ?? 0,
            comment: s.comment,
          };
          scoresByProject[row.projectId] = scoresByProject[row.projectId] || [];
          scoresByProject[row.projectId].push(row);
        });

        const criteriaCount = (criteriaList || []).length;

        const merged: Project[] = (dbProjects || [])
          .map((dbProject: any) => {
            const project = adaptDbProject(dbProject);
            const scores = scoresByProject[project.id] || [];
            if (scores.length > 0 && (criteriaCount === 0 || scores.length >= criteriaCount)) {
              project.status = "completed";
            }
            if (scores.length > 0) {
              const _total = computeCriteriaTotal(scores, criteriaById);
              project.scores = project.scores || {
                relevance: 0,
                innovation: 0,
                feasibility: 0,
                impact: 0,
                presentation: 0,
                bmc: 0,
                bonusData: 0,
                bonusPrototype: 0,
                bonusQa: 0,
                penaltyTime: 0,
                penaltyQuality: 0,
              };
              project.comments = project.comments || {};
              (project as any).totalScore = _total;
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
      .channel(`scores-${judgeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "criteria_scores", filter: `judge_id=eq.${judgeId}` },
        fetchAllData
      )
      .subscribe();

    return () => {
      if (channelProjects) supabase.removeChannel(channelProjects);
      if (channelEvals) supabase.removeChannel(channelEvals);
    };
  }, [judgeId, isAdmin, judgeProfile?.type]);

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
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 mobai-topbar z-50">
        <div className="flex justify-between items-center py-5 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <img src="/mobai_logo_1.png" alt="Mob AI" className="h-10 w-auto" />
            <span className="mobai-chip hidden sm:inline-flex">Jury Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-lg font-light text-white/90 mr-2">
              Welcome, <span className="font-normal text-white">{judgeName}</span>
            </p>
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                className="bg-white/10 hover:bg-white/20 p-2 h-9 w-9 flex items-center justify-center text-white rounded-xl border border-white/10"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={signOut}
              className="bg-white/10 hover:bg-white/20 p-2 h-9 w-9 flex items-center justify-center rounded-xl border border-white/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-28 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="my-20" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Total Projects" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Completed" value={stats.completed} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search by team name"
              className="pl-11 mobai-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
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
                  className={`transition-all duration-300 mobai-card ${isCompleted ? "opacity-75" : "hover:border-white/30"}`}
                >
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-xl font-bold ${isCompleted ? "text-white/50 line-through" : "text-white"}`}
                        >
                          {project.teamName}
                        </h3>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white/70 border border-white/10">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                      <p className={`font-medium text-lg ${isCompleted ? "text-white/60" : "text-white"}`}>
                        {project.name}
                      </p>
                      <p className="text-white/60 text-sm">
                        <span className="text-white/80 font-medium">Team Leader:</span>{" "}
                        {project.teamLeader || "Not set"}
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="gradient"
                        className={`rounded-xl px-6 ${isCompleted ? "opacity-80" : ""}`}
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
          <div className="text-center text-white/50 py-12">No projects found.</div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="mobai-panel p-6">
    <h3 className="text-lg font-medium text-white/80 mb-2">{label}</h3>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <Button
    onClick={onClick}
    className={`rounded-xl px-6 ${active
      ? "mobai-button"
      : "mobai-button-outline"
      }`}
  >
    {label}
  </Button>
);

export default Dashboard;