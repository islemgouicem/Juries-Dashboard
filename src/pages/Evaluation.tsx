import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Project, ClientEvaluationData, DbEvaluation } from "../../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const defaultEvaluation: ClientEvaluationData = {
  relevance: 5,
  innovation: 5,
  feasibility: 5,
  impact: 5,
  presentation: 5,
  bmc: 0,
  bonusData: 0,
  bonusPrototype: 0,
  bonusQa: 0,
  penaltyTime: 0,
  penaltyQuality: 0,
  relevanceComment: "",
  innovationComment: "",
  feasibilityComment: "",
  impactComment: "",
  presentationComment: "",
  bmcComment: "",
  bonusDataComment: "",
  bonusPrototypeComment: "",
  bonusQaComment: "",
  penaltyComment: "",
};

const dbToClientState = (db: DbEvaluation): ClientEvaluationData => ({
  relevance: db.relevance_score ?? 5,
  innovation: db.innovation_score ?? 5,
  feasibility: db.feasibility_score ?? 5,
  impact: db.impact_score ?? 5,
  presentation: db.presentation_score ?? 5,
  bmc: db.bmc_score ?? 0,
  bonusData: db.bonus_data ?? 0,
  bonusPrototype: db.bonus_prototype ?? 0,
  bonusQa: db.bonus_qa ?? 0,
  penaltyTime: db.penalty_time ?? 0,
  penaltyQuality: db.penalty_quality ?? 0,
  relevanceComment: db.relevance_comment ?? "",
  innovationComment: db.innovation_comment ?? "",
  feasibilityComment: db.feasibility_comment ?? "",
  impactComment: db.impact_comment ?? "",
  presentationComment: db.presentation_comment ?? "",
  bmcComment: db.bmc_comment ?? "",
  bonusDataComment: db.bonus_data_comment ?? "",
  bonusPrototypeComment: db.bonus_proto_comment ?? "",
  bonusQaComment: db.bonus_qa_comment ?? "",
  penaltyComment: db.penalty_comment ?? "",
});

const clientToDbState = (c: ClientEvaluationData, judgeId: string, projectId: string) => ({
  judge_id: judgeId,
  project_id: projectId,
  relevance_score: c.relevance,
  innovation_score: c.innovation,
  feasibility_score: c.feasibility,
  impact_score: c.impact,
  presentation_score: c.presentation,
  bmc_score: c.bmc,
  bonus_data: c.bonusData,
  bonus_prototype: c.bonusPrototype,
  bonus_qa: c.bonusQa,
  penalty_time: c.penaltyTime,
  penalty_quality: c.penaltyQuality,
  relevance_comment: c.relevanceComment,
  innovation_comment: c.innovationComment,
  feasibility_comment: c.feasibilityComment,
  impact_comment: c.impactComment,
  presentation_comment: c.presentationComment,
  bmc_comment: c.bmcComment,
  bonus_data_comment: c.bonusDataComment,
  bonus_proto_comment: c.bonusPrototypeComment,
  bonus_qa_comment: c.bonusQaComment,
  penalty_comment: c.penaltyComment,
});

const computeTotals = (c: ClientEvaluationData) => {
  const base =
    c.relevance * 2.5 +
    c.innovation * 2 +
    c.feasibility * 2 +
    c.impact * 2 +
    c.presentation * 1.5;
  const bonus = c.bonusData + c.bonusPrototype + c.bonusQa;
  const penalties = (c.penaltyTime ?? 0) + (c.penaltyQuality ?? 0);
  const total = base + c.bmc + bonus + penalties;
  return { base, bonus, penalties, total };
};

const Evaluation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { judgeProfile, themeIds } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<ClientEvaluationData>(defaultEvaluation);
  const [penaltySelections, setPenaltySelections] = useState<number[]>([]);
  const judgeId = judgeProfile?.id;

  const totals = useMemo(() => computeTotals(evaluationData), [evaluationData]);

  useEffect(() => {
    const fetchProjectAndEvaluation = async () => {
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
          if (themeIds.length && !themeIds.includes(dbProject.theme_id) && !judgeProfile?.isAdmin) {
            throw new Error("You are not assigned to this theme.");
          }
          const p: Project = {
            id: dbProject.id,
            name: dbProject.name,
            teamName: dbProject.team_name,
            problematic: dbProject.problematic,
            teamMembers: dbProject.team_members || [],
            themeId: dbProject.theme_id,
          };
          setProject(p);

          const { data: dbEvaluation, error: evaluationError } = await supabase
            .from("evaluations_1")
            .select("*")
            .eq("project_id", id)
            .eq("judge_id", judgeId)
            .maybeSingle();
          if (evaluationError) throw evaluationError;

          if (dbEvaluation) {
            setEvaluationId(dbEvaluation.id);
            const c = dbToClientState(dbEvaluation);
            setEvaluationData(c);
            // hydrate penalty selections best-effort
            const opts = [-5, -3, -1];
            const selected: number[] = [];
            let remaining = c.penaltyQuality;
            for (const v of opts) {
              if (remaining <= v && remaining !== 0) {
                selected.push(v);
                remaining -= v;
              }
            }
            setPenaltySelections(selected);
          } else {
            setEvaluationId(null);
            setEvaluationData(defaultEvaluation);
            setPenaltySelections([]);
          }
        }
      } catch (e) {
        console.error("Error fetching project/evaluation data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndEvaluation();
  }, [id, judgeId, themeIds, judgeProfile?.isAdmin]);

  const handleSubmit = async () => {
    if (!id || !judgeId) return;
    const payload = clientToDbState(evaluationData, judgeId, id);
    try {
      if (evaluationId) {
        const { error } = await supabase.from("evaluations_1").update(payload).eq("id", evaluationId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("evaluations_1").insert([payload]);
        if (error) throw error;
      }
      navigate("/dashboard");
    } catch (e) {
      console.error("Submission error:", e);
      alert("Failed to save evaluation.");
    }
  };

  const numberInput = (
    label: string,
    key: keyof Pick<ClientEvaluationData, "relevance" | "innovation" | "feasibility" | "impact" | "presentation">,
    commentKey: keyof Pick<
      ClientEvaluationData,
      | "relevanceComment"
      | "innovationComment"
      | "feasibilityComment"
      | "impactComment"
      | "presentationComment"
    >,
    weight: number
  ) => (
    <Card className="bg-[#2d1b69]/30 border-[#C68313]/20 mb-6">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#C68313]">{label}</h3>
          <span className="text-sm text-gray-300">Weight ×{weight}</span>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={1}
            max={10}
            step={1}
            value={evaluationData[key]}
            onChange={(e) => setEvaluationData((prev) => ({ ...prev, [key]: parseInt(e.target.value || "0", 10) }))}
            className="w-24 bg-[#1a0b2e]/50 border border-[#C68313]/30 rounded-lg p-2 text-white"
          />
          <span className="text-gray-400 text-sm">Enter 1–10</span>
        </div>
        <textarea
          className="w-full bg-[#1a0b2e]/50 border border-[#C68313]/30 rounded-lg p-3 text-white text-sm resize-none h-18"
          placeholder="Comment (optional)"
          value={evaluationData[commentKey]}
          onChange={(e) => setEvaluationData((prev) => ({ ...prev, [commentKey]: e.target.value }))}
        />
      </CardContent>
    </Card>
  );

  const selectRow = (
    label: string,
    options: { label: string; value: number }[],
    key: keyof Pick<ClientEvaluationData, "bmc" | "bonusData" | "bonusPrototype" | "bonusQa" | "penaltyTime">,
    commentKey?: keyof Pick<ClientEvaluationData, "bmcComment" | "bonusDataComment" | "bonusPrototypeComment" | "bonusQaComment">
  ) => (
    <Card className="bg-[#2d1b69]/30 border-[#C68313]/20 mb-6">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#C68313]">{label}</h3>
          <span className="text-sm text-gray-300">Points: {evaluationData[key]}</span>
        </div>
        <div className="grid gap-2">
          {options.map((opt) => (
            <label
              key={opt.value + opt.label}
              className={`flex items-center justify-between px-3 py-2 rounded border cursor-pointer ${evaluationData[key] === opt.value ? "border-[#F5A623] text-white" : "border-[#8B4FB3]/60 text-gray-300"
                }`}
            >
              <span>{opt.label}</span>
              <input
                type="radio"
                className="hidden"
                checked={evaluationData[key] === opt.value}
                onChange={() => setEvaluationData((prev) => ({ ...prev, [key]: opt.value }))}
              />
              <span className="text-sm text-[#F5A623] font-medium">{opt.value > 0 ? `+${opt.value}` : opt.value}</span>
            </label>
          ))}
        </div>
        {commentKey && (
          <textarea
            className="w-full bg-[#1a0b2e]/50 border border-[#C68313]/30 rounded-lg p-3 text-white text-sm resize-none h-16"
            placeholder="Comment (optional)"
            value={evaluationData[commentKey]}
            onChange={(e) => setEvaluationData((prev) => ({ ...prev, [commentKey]: e.target.value }))}
          />
        )}
      </CardContent>
    </Card>
  );

  const penaltyQualityOptions = [
    { label: "Poor quality / wrong format (-5)", value: -5 },
    { label: "Too text-heavy (-3)", value: -3 },
    { label: "Multiple typos (-1)", value: -1 },
  ];

  const handlePenaltySelect = (value: number) => {
    setPenaltySelections((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((v) => v !== value) : [...prev, value];
      const sum = next.reduce((acc, v) => acc + v, 0);
      setEvaluationData((p) => ({ ...p, penaltyQuality: sum }));
      return next;
    });
  };

  if (loading) return <div className="p-10 text-white pt-32 text-center">Loading...</div>;
  if (!project) return <div className="p-10 text-white pt-32 text-center">Project not found or not assigned.</div>;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-[#2B1055] z-50" style={{ borderBottom: "1px solid #F5A623" }}>
        <div className="flex justify-between items-center py-6 px-6 md:px-12 max-w-5xl mx-auto">
          <div>
            <img src="/LOGO.png" alt="Eunoia" className="h-12 w-auto" />
          </div>
          <div className="text-white text-right">
            <p className="text-xl font-light">
              Total: <span className="font-normal">{totals.total.toFixed(1)}</span> / 125
            </p>
            <p className="text-xs text-gray-300">
              Base {totals.base.toFixed(1)} | Bonus {totals.bonus.toFixed(1)} | Penalties {totals.penalties}
            </p>
          </div>
        </div>
      </div>

      <div className="my-24" />
      <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full pb-64">
        <Card className="bg-[#2d1b69]/40 border-[#C68313]/30 mb-8">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-[#C68313] mb-1">{project.teamName}</h3>
            <h4 className="text-xl text-white font-medium mb-3">{project.name}</h4>
            <p className="text-gray-300 text-sm mb-2">
              <span className="text-gray-400">Problematic:</span> {project.problematic}
            </p>
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400">Team Members:</span> {project.teamMembers.join(", ")}
            </p>
          </CardContent>
        </Card>

        {numberInput("Relevance of Solution", "relevance", "relevanceComment", 2.5)}
        {numberInput("Innovation & Creativity", "innovation", "innovationComment", 2)}
        {numberInput("Feasibility", "feasibility", "feasibilityComment", 2)}
        {numberInput("Impact", "impact", "impactComment", 2)}
        {numberInput("Quality of Presentation", "presentation", "presentationComment", 1.5)}

        {selectRow(
          "Business Model Canvas Completeness",
          [
            { label: "Complete (all 9 components, thorough)", value: 10 },
            { label: "7-8 components well developed", value: 7 },
            { label: "5-6 components addressed", value: 4 },
            { label: "Fewer than 5 components", value: 0 },
            { label: "Missing or extremely incomplete", value: -5 },
          ],
          "bmc",
          "bmcComment"
        )}

        {selectRow(
          "Bonus: Data-Driven Problem Analysis",
          [
            { label: "Strongly supported by data/research", value: 5 },
            { label: "Good use of data", value: 3 },
            { label: "Minimal data", value: 1 },
            { label: "No data", value: 0 },
          ],
          "bonusData",
          "bonusDataComment"
        )}
        {selectRow(
          "Bonus: Prototype or Visual Demonstration",
          [
            { label: "Working prototype / strong demo", value: 5 },
            { label: "Basic prototype / mockup", value: 3 },
            { label: "No prototype", value: 0 },
          ],
          "bonusPrototype",
          "bonusPrototypeComment"
        )}
        {selectRow(
          "Bonus: Q&A Performance",
          [
            { label: "Excellent responses", value: 5 },
            { label: "Good responses", value: 3 },
            { label: "Weak responses", value: 1 },
            { label: "Poor Q&A", value: 0 },
          ],
          "bonusQa",
          "bonusQaComment"
        )}

        <Card className="bg-[#2d1b69]/30 border-[#C68313]/20 mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#C68313]">Penalties</h3>
              <span className="text-sm text-gray-300">
                Time: {evaluationData.penaltyTime} | Quality: {evaluationData.penaltyQuality}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-white text-sm font-medium">Time Management</div>
              <div className="grid gap-2">
                {[{ label: "Within 5 minutes (0)", value: 0 }, { label: "Over by 10-30s (-1)", value: -1 }, { label: "Over by >30s (-5)", value: -5 }].map(
                  (opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between px-3 py-2 rounded border cursor-pointer ${evaluationData.penaltyTime === opt.value
                        ? "border-[#F5A623] text-white"
                        : "border-[#8B4FB3]/60 text-gray-300"
                        }`}
                    >
                      <span>{opt.label}</span>
                      <input
                        type="radio"
                        className="hidden"
                        checked={evaluationData.penaltyTime === opt.value}
                        onChange={() => setEvaluationData((prev) => ({ ...prev, penaltyTime: opt.value }))}
                      />
                      <span className="text-sm text-[#F5A623] font-medium">{opt.value}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white text-sm font-medium">Deliverable Quality (multi-select)</div>
              <div className="flex flex-wrap gap-2">
                {penaltyQualityOptions.map((opt) => {
                  const checked = penaltySelections.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`px-3 py-2 rounded border text-sm ${checked ? "border-red-400 text-red-200 bg-red-900/20" : "border-[#8B4FB3]/60 text-gray-200"
                        }`}
                      onClick={() => handlePenaltySelect(opt.value)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              className="w-full bg-[#1a0b2e]/50 border border-[#C68313]/30 rounded-lg p-3 text-white text-sm resize-none h-20"
              placeholder="Penalty notes (optional)"
              value={evaluationData.penaltyComment}
              onChange={(e) => setEvaluationData((prev) => ({ ...prev, penaltyComment: e.target.value }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-[#430870] z-50">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
          <Button
            variant="ghost"
            className="text-[#F5A623] border border-[#F5A623]/40 bg-transparent px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Button>
          <Button
            className="bg-gradient-to-b from-[#F5A623] to-[#D4941A] text-[#430870] rounded-lg px-6 py-2"
            onClick={handleSubmit}
          >
            {evaluationId ? "Update Evaluation" : "Submit Evaluation"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Evaluation;