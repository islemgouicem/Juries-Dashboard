import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Project, ClientEvaluationData, DbEvaluation } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../src/context/AuthContext";

const dbToClientState = (db: DbEvaluation): ClientEvaluationData => ({
    innovation: db.innovation_score,
    feasibility: db.feasibility_score,
    technical: db.technical_score,
    innovationComment: db.innovation_comment || "",
    feasibilityComment: db.feasibility_comment || "",
    technicalComment: db.technical_comment || "",
});

const clientToDbState = (client: ClientEvaluationData, judgeId: string, projectId: string) => ({
    judge_id: judgeId,
    project_id: projectId,
    innovation_score: client.innovation,
    feasibility_score: client.feasibility,
    technical_score: client.technical,
    innovation_comment: client.innovationComment,
    feasibility_comment: client.feasibilityComment,
    technical_comment: client.technicalComment,
});

const defaultEvaluation: ClientEvaluationData = {
    innovation: 10,
    feasibility: 10,
    technical: 10,
    innovationComment: "",
    feasibilityComment: "",
    technicalComment: ""
};

const Evaluation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { judgeProfile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<ClientEvaluationData>(defaultEvaluation);
  const totalScore = evaluationData.innovation + evaluationData.feasibility + evaluationData.technical;
  const judgeId = judgeProfile?.id;

  useEffect(() => {
    const fetchProjectAndEvaluation = async () => {
        if (!id || !judgeId) return;
        setLoading(true);
        try {
            const { data: dbProject, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (projectError) throw projectError;

            if (dbProject) {
                const p: Project = {
                    id: dbProject.id,
                    name: dbProject.name,
                    teamName: dbProject.team_name,
                    problematic: dbProject.problematic,
                    teamMembers: dbProject.team_members || [],
                };
                setProject(p);

                const { data: dbEvaluation, error: evaluationError } = await supabase
                    .from('evaluations')
                    .select('*')
                    .eq('project_id', id)
                    .eq('judge_id', judgeId)
                    .maybeSingle();
                if (evaluationError) throw evaluationError;

                if (dbEvaluation) {
                    setEvaluationId(dbEvaluation.id);
                    setEvaluationData(dbToClientState(dbEvaluation));
                } else {
                    setEvaluationId(null);
                    setEvaluationData(defaultEvaluation);
                }
            }
        } catch (e) {
            console.error("Error fetching project/evaluation data:", e);
        } finally {
            setLoading(false);
        }
    };
    fetchProjectAndEvaluation();
  }, [id, judgeId]);

  if (loading) return <div className="p-10 text-white pt-32 text-center">Loading project and previous evaluation...</div>;
  if (!project) return <div className="p-10 text-white pt-32 text-center">Project with ID {id} not found.</div>;

  const handleScoreChange = (criteria: keyof Pick<ClientEvaluationData, 'innovation' | 'feasibility' | 'technical'>, value: number) => {
    setEvaluationData(prev => ({ ...prev, [criteria]: value }));
  };

  const handleCommentChange = (criteria: keyof Pick<ClientEvaluationData, 'innovationComment' | 'feasibilityComment' | 'technicalComment'>, value: string) => {
    setEvaluationData(prev => ({ ...prev, [criteria]: value }));
  };

  const handleSubmit = async () => {
    if (!id || !judgeId) return;
    const dbPayload = clientToDbState(evaluationData, judgeId, id);
    try {
        if (evaluationId) {
            const { error } = await supabase
                .from('evaluations')
                .update(dbPayload)
                .eq('id', evaluationId);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('evaluations')
                .insert([dbPayload]);
            if (error) throw error;
        }
        navigate("/dashboard");
    } catch (e) {
        console.error("Submission error:", e);
        alert("Failed to save evaluation. See console for details.");
    }
  };

  const scoreCriteria = (
    title: string,
    detail: string,
    scoreKey: keyof Pick<ClientEvaluationData, 'innovation' | 'feasibility' | 'technical'>,
    commentKey: keyof Pick<ClientEvaluationData, 'innovationComment' | 'feasibilityComment' | 'technicalComment'>
  ) => (
    <Card className="bg-[#2d1b69]/30 border-[#C68313]/20 mb-6">
      <CardContent className="p-6">
          <h3 className="text-xl font-bold text-[#C68313] mb-1">{title}</h3>
          <p className="text-white text-sm mb-4">{detail}</p>
          <div className="mb-6">
              <div className="flex justify-between text-white text-sm mb-2">
                  <span>Score: {evaluationData[scoreKey]}/20</span>
              </div>
              <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={evaluationData[scoreKey]} 
                  onChange={(e) => handleScoreChange(scoreKey, parseInt(e.target.value))}
                  className="w-full"
              />
          </div>
          <div className="space-y-2">
              <label className="text-white text-sm">Comment (Optional)</label>
              <textarea 
                  className="w-full bg-[#1a0b2e]/50 border border-[#C68313]/30 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#C68313] resize-none h-24"
                  placeholder="Add your feedback for this criteria..."
                  value={evaluationData[commentKey]}
                  onChange={(e) => handleCommentChange(commentKey, e.target.value)}
              />
          </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-[#2B1055] z-50" style={{ borderBottom: '1px solid #F5A623' }}>
        <div className="flex justify-between items-center py-6 px-6 md:px-12 max-w-5xl mx-auto">
          <div>
              <img src="/LOGO.png" alt="Eunoia" className="h-12 w-auto" />
          </div>
          <div className="text-white text-right">
              <p className="text-xl font-light">Total Score: <span className="font-normal">{totalScore}/60</span></p>
          </div>
        </div>
      </div>

      <div className="my-24" />

      <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full pb-64">
        <Card className="bg-[#2d1b69]/40 border-[#C68313]/30 mb-8">
          <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-[#C68313] mb-1">{project.teamName}</h3>
              <h4 className="text-xl text-white font-medium mb-3">{project.name}</h4>
              <p className="text-gray-300 text-sm mb-2"><span className="text-gray-400">Problematic:</span> {project.problematic}</p>
              <p className="text-gray-300 text-sm"><span className="text-gray-400">Team Members:</span> {project.teamMembers.join(", ")}</p>
          </CardContent>
        </Card>

        {scoreCriteria("Innovation & Creativity", "Originality and uniqueness of the idea", 'innovation', 'innovationComment')}
        {scoreCriteria("Feasibility", "Practicality and implementability of the solution", 'feasibility', 'feasibilityComment')}
        <div className="mb-32">
          {scoreCriteria("Technical Complexity", "Use of technology and technical execution", 'technical', 'technicalComment')}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-[#430870] z-50">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
          <Button 
              variant="ghost" 
              className="text-[#F5A623] hover:text-[#F5A623]/80 border border-[#F5A623]/40 hover:bg-[#F5A623]/10 bg-transparent px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => navigate('/dashboard')}
          >
              <ArrowLeft className="w-4 h-4" />
              Back Home
          </Button>
          <Button 
              className="bg-gradient-to-b from-[#F5A623] to-[#D4941A] text-[#430870] hover:from-[#F5A623]/90 hover:to-[#D4941A]/90 rounded-lg shadow-lg px-6 py-2 font-medium"
              onClick={handleSubmit}
          >
              {evaluationId ? 'Update Evaluation' : 'Submit Evaluation'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Evaluation;
