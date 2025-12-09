import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Search, LogOut, Settings } from "lucide-react";
import { Project, DbEvaluation } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../src/context/AuthContext";

const adaptDbProject = (dbProject: any): Project => ({
    id: dbProject.id,
    name: dbProject.name,
    teamName: dbProject.team_name,
    problematic: dbProject.problematic,
    teamMembers: dbProject.team_members || [], 
    status: 'pending',
});

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { judgeProfile, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const judgeName = judgeProfile?.name || "Judge";
  const judgeId = judgeProfile?.id;
  const isAdmin = judgeProfile?.isAdmin || false;

  useEffect(() => {
    const fetchAllData = async () => {
      if (!judgeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: dbProjects } = await supabase
          .from('projects')
          .select('*')
          .order('name', { ascending: true });

        const { data: myEvaluations } = await supabase
          .from('evaluations')
          .select('project_id, innovation_score, feasibility_score, technical_score')
          .eq('judge_id', judgeId);

        const evaluatedProjectIds = new Set(myEvaluations?.map((e: DbEvaluation) => e.project_id) || []);
        const evaluationsMap = myEvaluations?.reduce((acc: any, e: DbEvaluation) => {
            acc[e.project_id] = {
                innovation: e.innovation_score,
                feasibility: e.feasibility_score,
                technical: e.technical_score,
            };
            return acc;
        }, {}) || {};

        const mergedProjects: Project[] = (dbProjects || []).map((dbProject: any) => {
          const project = adaptDbProject(dbProject);
          project.status = evaluatedProjectIds.has(project.id) ? 'completed' : 'pending';
          if (project.status === 'completed') {
              project.scores = evaluationsMap[project.id];
          }
          return project;
        });

        setProjects(mergedProjects);
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [judgeId]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.teamName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const projectStatus = project.status || 'pending';
    const matchesTab = activeTab === 'all' ? true : projectStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: projects.length,
    pending: projects.filter(p => (p.status || 'pending') === 'pending').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-[#430870]">
      <div className="fixed top-0 left-0 right-0 bg-[#2B1055] z-50 border-b border-[#F5A623]">
        <div className="flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto">
          <div>
            <img src="/LOGO.png" alt="Eunoia by Skill & Tell" className="h-12 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xl font-light text-white mr-2">
              Welcome, <span className="font-normal">{judgeName}</span>
            </p>
            {isAdmin && (
              <Button 
                onClick={() => navigate('/admin')} 
                className="bg-[#C68313] hover:bg-[#D4941A] p-2 h-9 w-9 flex items-center justify-center text-[#2B1055] rounded-md"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}
            <Button 
              onClick={logout} 
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
          <div className="bg-[#2d1b69]/40 backdrop-blur-sm border border-[#C68313]/30 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-2">Total Projects</h3>
            <p className="text-3xl font-bold text-[#C68313]">{stats.total}</p>
          </div>
          <div className="bg-[#2d1b69]/40 backdrop-blur-sm border border-[#C68313]/30 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-2">Pending</h3>
            <p className="text-3xl font-bold text-[#C68313]">{stats.pending}</p>
          </div>
          <div className="bg-[#2d1b69]/40 backdrop-blur-sm border border-[#C68313]/30 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-2">Completed</h3>
            <p className="text-3xl font-bold text-[#C68313]">{stats.completed}</p>
          </div>
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
            <Button 
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-6 ${activeTab === 'all' ? 'bg-[#C68313] text-black hover:bg-[#C68313]/90' : 'bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60'}`}
            >
              All
            </Button>
            <Button 
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-6 ${activeTab === 'pending' ? 'bg-[#C68313] text-black hover:bg-[#C68313]/90' : 'bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60'}`}
            >
              Pending
            </Button>
            <Button 
              onClick={() => setActiveTab('completed')}
              className={`rounded-lg px-6 ${activeTab === 'completed' ? 'bg-[#C68313] text-black hover:bg-[#C68313]/90' : 'bg-[#2d1b69]/40 text-white border border-[#C68313]/30 hover:bg-[#2d1b69]/60'}`}
            >
              Completed
            </Button>
          </div>
        </div>
          
        {loading ? (
          <div className="text-center text-xl text-gray-300 py-12">
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="bg-[#2d1b69]/30 border-[#C68313]/20 hover:border-[#C68313]/50 transition-all duration-300">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-[#C68313]">{project.teamName}</h3>
                    <p className="text-white font-medium text-lg">{project.name}</p>
                    <p className="text-gray-400 text-sm"><span className="text-gray-300 font-medium">Problematic:</span> {project.problematic}</p>
                    <p className="text-gray-400 text-sm"><span className="text-gray-300 font-medium">Team Members:</span> {project.teamMembers.join(", ")}</p>
                  </div>
                  <div>
                    <Button 
                      variant="gradient" 
                      className="rounded-lg px-6 shadow-[0_0_15px_rgba(198,131,19,0.3)]"
                      onClick={() => navigate(`/evaluate/${project.id}`)}
                    >
                      {project.status === 'completed' ? 'Edit Evaluation' : 'Evaluate Project'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
