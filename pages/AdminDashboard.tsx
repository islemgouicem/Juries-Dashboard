import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { supabase } from "../lib/supabase";
import { useAuth } from "../src/context/AuthContext";
import { Check, UserPlus, FilePlus, Trophy, TrendingUp, Eye, EyeOff } from "lucide-react";

interface JudgeScore {
  judgeName: string;
  innovation: number;
  feasibility: number;
  technical: number;
  total: number;
}

interface ProjectRanking {
  id: string;
  name: string;
  teamName: string;
  problematic: string;
  teamMembers: string[];
  judgeScores: JudgeScore[];
  totalScore: number;
  avgScore: number;
  numJudges: number;
}

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const AddProjectForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [name, setName] = useState("");
    const [teamName, setTeamName] = useState("");
    const [problematic, setProblematic] = useState("");
    const [teamMembersInput, setTeamMembersInput] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !teamName || !problematic || !teamMembersInput) {
            setMessage("All project fields must be filled.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const teamMembersArray = teamMembersInput.split(',').map(m => m.trim()).filter(m => m.length > 0);
            const newProjectId = generateUUID(); 

            const { error } = await supabase
                .from('projects')
                .insert({
                    id: newProjectId,
                    name: name.trim(),
                    team_name: teamName.trim(),
                    problematic: problematic.trim(),
                    team_members: teamMembersArray,
                });

            if (error) throw error;

            setMessage("Project added successfully!");
            setStatus('success');
            setName("");
            setTeamName("");
            setProblematic("");
            setTeamMembersInput("");
            onSuccess(); 

        } catch (e: any) {
            console.error("Error adding project:", e);
            setMessage(`Error adding project: ${e.message || 'Unknown error'}`);
            setStatus('error');
        } finally {
             if (status === 'loading') setTimeout(() => setStatus('idle'), 2000); 
        }
    };

    const isSubmitting = status === 'loading';
    const bgColor = status === 'success' ? 'bg-green-700/30 border-green-500/50' : status === 'error' ? 'bg-red-900/30 border-red-500/50' : '';
    const textColor = status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : '';

    return (
        <Card className="bg-[#2d1b69]/40 border-[#C68313]/30">
            <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-[#F5A623]"/> Add Project Team
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        placeholder="Project Title (e.g., Eunoia MVP)" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        disabled={isSubmitting} 
                        className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
                    />
                    <Input 
                        placeholder="Team Name (e.g., Tech Wizards)" 
                        value={teamName} 
                        onChange={e => setTeamName(e.target.value)} 
                        disabled={isSubmitting} 
                        className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
                    />
                    <Input 
                        placeholder="Problematic / Theme" 
                        value={problematic} 
                        onChange={e => setProblematic(e.target.value)} 
                        disabled={isSubmitting} 
                        className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
                    />
                    <Input 
                        placeholder="Team Members (Comma-separated: John Doe, Jane Smith)" 
                        value={teamMembersInput} 
                        onChange={e => setTeamMembersInput(e.target.value)} 
                        disabled={isSubmitting}
                        className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]">
                        {isSubmitting ? 'Adding...' : 'Add Project'}
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
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email) {
            setMessage("Full name and email are required.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const normalizedEmail = email.toLowerCase().trim();
            const temporaryPassword = Math.random().toString(36).slice(2, 10);
            
            const { data: userData, error: authError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password: temporaryPassword,
            });

            if (authError) throw authError;
            const newJudgeId = userData.user?.id;
            if (!newJudgeId) {
                 throw new Error("Authentication succeeded but failed to return a user ID. Please check the 'autoConfirm' settings if active.");
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: newJudgeId,
                    full_name: fullName.trim(),
                    email: normalizedEmail,
                    is_admin: false,
                });

            if (profileError) throw profileError;

            setMessage(`Judge ${fullName} added successfully! A temporary account has been created.`);
            setStatus('success');
            setFullName("");
            setEmail("");
            onSuccess();
            
        } catch (e: any) {
            console.error("Error adding judge:", e);
            let errorMsg = e.code === '23505' 
                ? 'Error: Judge with this email might already exist.' 
                : (e.message || 'Unknown error');
            if (e.message && e.message.includes("Email already registered")) {
                errorMsg = 'Error: The email is already registered in Supabase Authentication. It might already be a judge.';
            }

            setMessage(`Error adding judge: ${errorMsg}`);
            setStatus('error');
        } finally {
            if (status === 'loading') setTimeout(() => setStatus('idle'), 2000); 
        }
    };

    const isSubmitting = status === 'loading';
    const bgColor = status === 'success' ? 'bg-green-700/30 border-green-500/50' : status === 'error' ? 'bg-red-900/30 border-red-500/50' : '';
    const textColor = status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : '';

    return (
        <Card className="bg-[#2d1b69]/40 border-[#C68313]/30">
            <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#F5A623]"/> Add Judge
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        placeholder="Judge Full Name" 
                        value={fullName} 
                        onChange={e => setFullName(e.target.value)} 
                        disabled={isSubmitting} 
                        className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
                    />
                    <Input 
                        placeholder="Email Address" 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        disabled={isSubmitting} 
                        className="bg-transparent border-[#8B4FB3]/60 text-white placeholder:text-gray-500"
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]">
                        {isSubmitting ? 'Adding...' : 'Add Judge'}
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
  const [judges, setJudges] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (projectsError) throw projectsError;

      const { data: evaluations, error: evaluationsError } = await supabase
        .from('evaluations')
        .select('*');

      if (evaluationsError) throw evaluationsError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      const judgesMap: Record<string, string> = {};
      profiles.forEach((profile: any) => {
        judgesMap[profile.id] = profile.full_name;
      });
      setJudges(judgesMap);

      const projectRankings: ProjectRanking[] = projects.map((project: any) => {
        const projectEvals = evaluations.filter((e: any) => e.project_id === project.id);
        const judgeScores: JudgeScore[] = projectEvals.map((evaluation: any) => ({
          judgeName: judgesMap[evaluation.judge_id] || 'Unknown Judge',
          innovation: evaluation.innovation_score || 0,
          feasibility: evaluation.feasibility_score || 0,
          technical: evaluation.technical_score || 0,
          total: (evaluation.innovation_score || 0) + (evaluation.feasibility_score || 0) + (evaluation.technical_score || 0)
        }));

        const totalScore = judgeScores.reduce((sum, js) => sum + js.total, 0);
        const avgScore = judgeScores.length > 0 ? totalScore / judgeScores.length : 0;
        const numJudges = judgeScores.length;

        return {
          id: project.id,
          name: project.name,
          teamName: project.team_name,
          problematic: project.problematic,
          teamMembers: project.team_members || [],
          judgeScores,
          totalScore,
          avgScore,
          numJudges
        };
      });

      projectRankings.sort((a, b) => b.avgScore - a.avgScore);
      setRankings(projectRankings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
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
          <Trophy className="w-8 h-8"/> Project Rankings
        </h2>
        <div className="text-white text-sm">
          <span className="text-gray-400">Total Projects:</span> {rankings.length}
        </div>
      </div>

      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="pt-12">
            <Card className="bg-gradient-to-br from-[#C0C0C0]/20 to-[#2d1b69]/40 border-2 border-[#C0C0C0]/40">
              <CardContent className="p-4 text-center">
                <div className="mb-2">{getMedalIcon(2)}</div>
                <h3 className="text-lg font-bold text-white">{rankings[1].teamName}</h3>
                <p className="text-sm text-gray-300 mb-2 truncate">{rankings[1].name}</p>
                <div className="text-2xl font-bold text-[#C0C0C0]">
                  {rankings[1].avgScore.toFixed(1)}/60
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {rankings[1].numJudges} {rankings[1].numJudges === 1 ? 'judge' : 'judges'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-[#FFD700]/20 to-[#2d1b69]/40 border-2 border-[#FFD700]/60 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
              <CardContent className="p-4 text-center">
                <div className="mb-2">{getMedalIcon(1)}</div>
                <h3 className="text-xl font-bold text-white">{rankings[0].teamName}</h3>
                <p className="text-sm text-gray-300 mb-2 truncate">{rankings[0].name}</p>
                <div className="text-3xl font-bold text-[#FFD700]">
                  {rankings[0].avgScore.toFixed(1)}/60
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {rankings[0].numJudges} {rankings[0].numJudges === 1 ? 'judge' : 'judges'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="pt-12">
            <Card className="bg-gradient-to-br from-[#CD7F32]/20 to-[#2d1b69]/40 border-2 border-[#CD7F32]/40">
              <CardContent className="p-4 text-center">
                <div className="mb-2">{getMedalIcon(3)}</div>
                <h3 className="text-lg font-bold text-white">{rankings[2].teamName}</h3>
                <p className="text-sm text-gray-300 mb-2 truncate">{rankings[2].name}</p>
                <div className="text-2xl font-bold text-[#CD7F32]">
                  {rankings[2].avgScore.toFixed(1)}/60
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {rankings[2].numJudges} {rankings[2].numJudges === 1 ? 'judge' : 'judges'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rankings.map((project, index) => (
          <Card 
            key={project.id} 
            className={`bg-[#2d1b69]/30 border transition-all duration-300 ${
              index < 3 
                ? 'border-[#FFD700]/30 hover:border-[#FFD700]/50' 
                : 'border-[#C68313]/20 hover:border-[#C68313]/50'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getMedalIcon(index + 1)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-[#C68313]">{project.teamName}</h3>
                      {project.numJudges === 0 && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                          Not Evaluated
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium">{project.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.teamMembers?.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-[#F5A623]">
                      {project.avgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400">/ 60</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {project.numJudges} {project.numJudges === 1 ? 'evaluation' : 'evaluations'}
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
                <div className="mt-6 pt-6 border-t border-[#C68313]/20">
                  <h4 className="text-white font-semibold mb-4">Evaluations by Judge:</h4>
                  
                  {project.judgeScores.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No evaluations yet</p>
                  ) : (
                    <div className="space-y-3">
                      {project.judgeScores.map((score, idx) => (
                        <div 
                          key={idx} 
                          className="bg-[#1a0b2e]/50 rounded-lg p-4 border border-[#C68313]/10"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-medium text-white">{score.judgeName}</div>
                            <div className="text-xl font-bold text-[#F5A623]">{score.total}/60</div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 text-xs mb-1">Innovation</div>
                              <div className="text-white font-medium">{score.innovation}/20</div>
                            </div>
                            <div>
                              <div className="text-gray-400 text-xs mb-1">Feasibility</div>
                              <div className="text-white font-medium">{score.feasibility}/20</div>
                            </div>
                            <div>
                              <div className="text-gray-400 text-xs mb-1">Technical</div>
                              <div className="text-white font-medium">{score.technical}/20</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
    const { judgeProfile } = useAuth();
    const [activeView, setActiveView] = useState<'rankings' | 'manage'>('rankings');
    const isActuallyAdmin = judgeProfile?.isAdmin || false;

    return (
        <div className="p-6 md:p-12 pt-32 max-w-7xl mx-auto w-full min-h-screen">
             <div className="fixed top-0 left-0 right-0 bg-[#2B1055] z-50" style={{ borderBottom: '1px solid #F5A623' }}>
                <div className="flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto">
                    <div>
                        <img 
                            src="/LOGO.png" 
                            alt="Eunoia" 
                            className="h-12 w-auto"
                        />
                    </div>
                    <div className="text-white text-right">
                        <p className="text-xl font-light">Welcome, <span className="font-normal">{judgeProfile?.name || 'Admin'}</span></p>
                    </div>
                </div>
             </div>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-serif text-[#F5A623]">Admin Panel</h1>
                <Button 
                    onClick={() => navigate('/dashboard')} 
                    variant="ghost" 
                    className="text-white border border-[#F5A623]/40 hover:bg-[#F5A623]/10 bg-[#2d1b69]/40"
                >
                    <Check className="w-4 h-4 mr-2"/> Judge Dashboard
                </Button>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                onClick={() => setActiveView('rankings')}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                  activeView === 'rankings'
                    ? 'bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]'
                    : 'bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60'
                }`}
              >
                <Trophy className="w-5 h-5" />
                Rankings
              </Button>
              <Button
                onClick={() => setActiveView('manage')}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                  activeView === 'manage'
                    ? 'bg-[#F5A623] text-[#430870] hover:bg-[#D4941A]'
                    : 'bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Manage
              </Button>
            </div>

            {activeView === 'rankings' ? (
              <RankingsView />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddJudgeForm onSuccess={() => console.log('Judge added')} />
                <AddProjectForm onSuccess={() => console.log('Project added')} />
              </div>
            )}
            
            <div className="mt-8 text-sm text-gray-500">
                <p>Logged in as: <span className="text-gray-300">{judgeProfile?.email}</span> (Admin: <span className={`font-medium ${isActuallyAdmin ? 'text-green-400' : 'text-red-400'}`}>{isActuallyAdmin ? 'TRUE' : 'FALSE'}</span>)</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
