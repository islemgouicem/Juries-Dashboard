import React, { useState } from 'react';
import StarBackground from './components/StarBackground';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Evaluation from './components/Evaluation';
import { User, Project, ViewState } from './types';
import { MOCK_PROJECTS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setView('dashboard');
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('evaluation');
  };

  const handleSubmitEvaluation = (projectId: string, scores: Project['scores'], comments: Project['comments']) => {
    setProjects(prevProjects => 
      prevProjects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'completed',
            scores,
            comments
          };
        }
        return p;
      })
    );
    setView('dashboard');
    setSelectedProjectId(null);
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setView('dashboard');
  };

  const getSelectedProject = () => projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen relative text-white">
      <StarBackground />
      
      {view === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          projects={projects} 
          onSelectProject={handleSelectProject} 
        />
      )}

      {view === 'evaluation' && selectedProjectId && (
        <Evaluation 
          project={getSelectedProject()!} 
          onBack={handleBackToDashboard}
          onSubmit={handleSubmitEvaluation}
        />
      )}
    </div>
  );
};

export default App;