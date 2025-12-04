import React, { useState, useEffect } from 'react';
import { Project, CRITERIA_MAX_SCORE, TOTAL_MAX_SCORE } from '../types';
import { Logo } from './Logo';
import { ArrowLeft } from 'lucide-react';

interface EvaluationProps {
  project: Project;
  onBack: () => void;
  onSubmit: (projectId: string, scores: Project['scores'], comments: Project['comments']) => void;
}

const Evaluation: React.FC<EvaluationProps> = ({ project, onBack, onSubmit }) => {
  const [scores, setScores] = useState({
    innovation: 0,
    feasibility: 0,
    technical: 0,
  });

  const [comments, setComments] = useState({
    innovation: '',
    feasibility: '',
    technical: '',
  });

  useEffect(() => {
    if (project.scores) setScores(project.scores);
    if (project.comments) setComments(project.comments);
    window.scrollTo(0, 0);
  }, [project]);

  const totalScore = scores.innovation + scores.feasibility + scores.technical;

  const handleScoreChange = (criteria: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [criteria]: value }));
  };

  const handleCommentChange = (criteria: keyof typeof comments, value: string) => {
    setComments(prev => ({ ...prev, [criteria]: value }));
  };

  const handleSubmit = () => {
    onSubmit(project.id, scores, comments);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <Logo className="scale-75 origin-left" />
        <div className="text-right">
          <p className="text-gray-400 text-sm">Total score</p>
          <p className={`text-2xl font-bold ${totalScore === TOTAL_MAX_SCORE ? 'text-green-400' : 'text-white'}`}>
            {totalScore}/{TOTAL_MAX_SCORE}
          </p>
        </div>
      </header>

      {/* Project Info Card */}
      <div className="glass-card p-6 rounded-2xl mb-8 border-l-4 border-l-amber-500">
        <h3 className="text-xl font-bold text-amber-400 mb-1">{project.teamName}</h3>
        <p className="text-white text-lg font-medium mb-2">{project.projectName}</p>
        <p className="text-gray-400 text-sm mb-1"><span className="text-gray-500">Problematic:</span> {project.problematic}</p>
        <p className="text-gray-400 text-sm">
          <span className="text-gray-500">Team Members:</span> {project.members.join(', ')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Innovation Criteria */}
        <CriteriaCard 
          title="Innovation & Creativity"
          description="Originality and uniqueness of the idea"
          score={scores.innovation}
          comment={comments.innovation}
          onScoreChange={(val) => handleScoreChange('innovation', val)}
          onCommentChange={(val) => handleCommentChange('innovation', val)}
        />

        {/* Feasibility Criteria */}
        <CriteriaCard 
          title="Feasibility"
          description="Practicality and implementability of the solution"
          score={scores.feasibility}
          comment={comments.feasibility}
          onScoreChange={(val) => handleScoreChange('feasibility', val)}
          onCommentChange={(val) => handleCommentChange('feasibility', val)}
        />

        {/* Technical Complexity Criteria */}
        <CriteriaCard 
          title="Technical Complexity"
          description="Use of technology and technical execution"
          score={scores.technical}
          comment={comments.technical}
          onScoreChange={(val) => handleScoreChange('technical', val)}
          onCommentChange={(val) => handleCommentChange('technical', val)}
        />
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1a0b2e]/90 backdrop-blur-md border-t border-white/10 p-4 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            <ArrowLeft size={18} />
            Back Home
          </button>
          
          <button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium px-8 py-3 rounded-lg shadow-lg shadow-amber-900/20 transition-all"
          >
            Submit Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual criteria to keep code clean
const CriteriaCard: React.FC<{
  title: string;
  description: string;
  score: number;
  comment: string;
  onScoreChange: (val: number) => void;
  onCommentChange: (val: string) => void;
}> = ({ title, description, score, comment, onScoreChange, onCommentChange }) => {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-amber-400">{title}</h4>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-white font-medium">Score: {score}/{CRITERIA_MAX_SCORE}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max={CRITERIA_MAX_SCORE} 
          value={score} 
          onChange={(e) => onScoreChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
        />
        {/* Simple dots visualization under slider could be added here if needed to match design precisely, but standard slider works well */}
      </div>

      <div>
        <label className="block text-white font-medium mb-2 text-sm">Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add your feedback for this criteria.."
          className="w-full glass-input rounded-xl p-4 placeholder-gray-500 text-sm h-24 resize-none"
        />
      </div>
    </div>
  );
}

export default Evaluation;