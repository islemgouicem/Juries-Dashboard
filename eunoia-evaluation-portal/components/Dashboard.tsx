import React, { useState, useMemo } from 'react';
import { User, Project } from '../types';
import { Logo } from './Logo';
import { Search } from 'lucide-react';

interface DashboardProps {
  user: User;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

type FilterType = 'all' | 'pending' | 'completed';

const Dashboard: React.FC<DashboardProps> = ({ user, projects, onSelectProject }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    return {
      total: projects.length,
      pending: projects.filter(p => p.status === 'pending').length,
      completed: projects.filter(p => p.status === 'completed').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesFilter = filter === 'all' || project.status === filter;
      const matchesSearch = 
        project.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, searchTerm]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-start md:items-center mb-10 flex-col md:flex-row gap-4">
        <Logo className="scale-75 origin-left" />
        <div className="text-right">
          <p className="text-gray-400 text-sm">Welcome,</p>
          <p className="text-xl font-medium text-white">{user.name}</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-transparent">
          <h3 className="text-white font-medium text-lg mb-1">Total Projects</h3>
          <p className="text-4xl font-bold text-amber-500">{stats.total}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-transparent">
          <h3 className="text-white font-medium text-lg mb-1">Pending</h3>
          <p className="text-4xl font-bold text-amber-500">{stats.pending}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-transparent">
          <h3 className="text-white font-medium text-lg mb-1">Completed</h3>
          <p className="text-4xl font-bold text-amber-500">{stats.completed}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by team name, project title ...etc"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-sm placeholder-gray-400"
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize border ${
                filter === f
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/20'
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-amber-500/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-amber-500/30 transition-colors">
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-bold text-amber-400">{project.teamName}</h3>
              <p className="text-white text-lg">{project.projectName}</p>
              <p className="text-gray-400 text-sm"><span className="text-gray-500">Problematic:</span> {project.problematic}</p>
              <p className="text-gray-400 text-sm pt-2">
                <span className="text-gray-500">Team Members:</span> {project.members.join(', ')}
              </p>
            </div>
            
            <button
              onClick={() => onSelectProject(project.id)}
              className={`px-8 py-3 rounded-lg font-medium transition-all whitespace-nowrap shadow-lg ${
                  project.status === 'completed' 
                  ? 'bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30'
                  : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-amber-900/20'
              }`}
            >
              {project.status === 'completed' ? 'Edit Evaluation' : 'Evaluate Project'}
            </button>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No projects found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;