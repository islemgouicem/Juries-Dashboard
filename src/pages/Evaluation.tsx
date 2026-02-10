import { ArrowLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Criteria, Project } from "../../types";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type CriteriaScoreDraft = { score: number; comment: string };

const Evaluation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { judgeProfile } = useAuth();
  const judgeId = judgeProfile?.id;
  const [project, setProject] = useState<Project | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [scoreMap, setScoreMap] = useState<Record<string, CriteriaScoreDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => {
    return criteria.reduce((sum, c) => {
      const s = scoreMap[c.id]?.score ?? 0;
      const weight = c.weight ?? 1;
      return sum + s * weight;
    }, 0);
  }, [criteria, scoreMap]);

  useEffect(() => {
    const fetchProjectAndScores = async () => {
      if (!id || !judgeId) return;
      setLoading(true);
      try {
        const { data: dbProject, error: projectError } = await supabase
          .from("projects_1")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (projectError) throw projectError;

        if (dbProject) {
          const p: Project = {
            id: dbProject.id,
            name: dbProject.name,
            teamName: dbProject.team_name,
            problematic: dbProject.problematic,
            teamMembers: dbProject.team_members || [],
            teamLeader: dbProject.team_leader ?? null,
            themeId: dbProject.theme_id,
          };
          setProject(p);
        }

        const judgeType = judgeProfile?.type || "";
        const { data: dbCriteria, error: criteriaError } = await supabase
          .from("criterias")
          .select("*")
          .eq("type", judgeType)
          .order("sort_order", { ascending: true });
        if (criteriaError) throw criteriaError;

        const criteriaList: Criteria[] = (dbCriteria || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          description: c.description,
          weight: c.weight,
          maxScore: c.max_score,
          sortOrder: c.sort_order,
        }));
        setCriteria(criteriaList);

        const { data: dbScores, error: scoresError } = await supabase
          .from("criteria_scores")
          .select("*")
          .eq("project_id", id)
          .eq("judge_id", judgeId);
        if (scoresError) throw scoresError;

        const nextMap: Record<string, CriteriaScoreDraft> = {};
        (dbScores || []).forEach((s: any) => {
          nextMap[s.criteria_id] = {
            score: s.score ?? 0,
            comment: s.comment ?? "",
          };
        });

        criteriaList.forEach((c) => {
          if (!nextMap[c.id]) {
            nextMap[c.id] = { score: 0, comment: "" };
          }
        });

        setScoreMap(nextMap);
      } catch (e) {
        console.error("Error fetching evaluation data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndScores();
  }, [id, judgeId, judgeProfile?.type]);

  const handleSubmit = async () => {
    if (!id || !judgeId) return;
    setSaving(true);
    try {
      const rows = criteria.map((c) => ({
        judge_id: judgeId,
        project_id: id,
        criteria_id: c.id,
        score: scoreMap[c.id]?.score ?? 0,
        comment: scoreMap[c.id]?.comment || null,
      }));

      const { error } = await supabase.from("criteria_scores").upsert(rows, {
        onConflict: "judge_id,project_id,criteria_id",
      });
      if (error) throw error;

      navigate("/dashboard");
    } catch (e) {
      console.error("Submission error:", e);
      alert("Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-white pt-32 text-center">Loading...</div>;
  if (!project) return <div className="p-10 text-white pt-32 text-center">Project not found.</div>;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 mobai-topbar z-50 border-b border-[#ff0006]/40">
        <div className="flex justify-between items-center py-5 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/mobai_logo_1.png" alt="Mob AI" className="h-10 w-auto" />
            <span className="hidden sm:inline-flex text-xs uppercase tracking-[0.2em] text-[#ff4b4b] border border-[#ff0006]/40 px-3 py-1 rounded-full">
              Evaluation
            </span>
          </div>
          <div className="text-white text-right">
            <p className="text-lg font-light">
              Total: <span className="font-normal text-[#ff4b4b]">{total.toFixed(1)}</span>
            </p>
            <p className="text-xs text-white/60">Jury Type: {judgeProfile?.type || "UNASSIGNED"}</p>
          </div>
        </div>
      </div>

      <div className="my-24" />
      <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full pb-64">
        <Card className="mobai-card mb-8 border-[#ff0006]/30">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-white mb-1">{project.teamName}</h3>
            <h4 className="text-xl text-white/90 font-medium mb-3">{project.name}</h4>
            <p className="text-white/60 text-sm">
              <span className="text-[#ff4b4b]">Team Leader:</span> {project.teamLeader || "Not set"}
            </p>
          </CardContent>
        </Card>

        {criteria.length === 0 ? (
          <div className="text-center text-gray-300">No criteria found for this jury type.</div>
        ) : (
          criteria.map((c) => {
            const max = c.maxScore ?? 10;
            const weight = c.weight ?? 1;
            const draft = scoreMap[c.id] || { score: 0, comment: "" };
            return (
              <Card key={c.id} className="mobai-panel mb-6 border-[#ff0006]/20">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#ff4b4b]">{c.name}</h3>
                      {c.description && <p className="text-xs text-white/50 mt-1">{c.description}</p>}
                    </div>
                    <span className="text-sm text-[#ff4b4b]">Weight ×{weight}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      min={0}
                      max={max}
                      step={1}
                      value={draft.score}
                      onChange={(e) =>
                        setScoreMap((prev) => ({
                          ...prev,
                          [c.id]: { ...prev[c.id], score: parseInt(e.target.value || "0", 10) },
                        }))
                      }
                      className="w-24 mobai-input h-11 border-[#ff0006]/30"
                    />
                    <span className="text-white/50 text-sm">0–{max}</span>
                  </div>
                  <textarea
                    className="w-full mobai-textarea text-sm resize-none h-20 border-[#ff0006]/20"
                    placeholder="Comment (optional)"
                    value={draft.comment}
                    onChange={(e) =>
                      setScoreMap((prev) => ({
                        ...prev,
                        [c.id]: { ...prev[c.id], comment: e.target.value },
                      }))
                    }
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-[#0f111a]/95 border-t border-[#ff0006]/30 z-50">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
          <Button
            variant="ghost"
            className="mobai-button-outline px-4 py-2 flex items-center gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Button>
          <Button
            className="mobai-button px-6 py-2"
            onClick={handleSubmit}
            disabled={saving || criteria.length === 0}
          >
            {saving ? "Saving..." : "Save Evaluation"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Evaluation;