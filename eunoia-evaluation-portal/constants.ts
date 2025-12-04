import { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    teamName: 'Team Alpha',
    projectName: 'EcoTrack Solution',
    problematic: 'Reducing carbon footprint in urban logistics through AI-driven routing.',
    members: ['Alice Johnson', 'Bob Smith', 'Carol White'],
    status: 'pending',
  },
  {
    id: '2',
    teamName: 'Beta Innovators',
    projectName: 'HealthSync App',
    problematic: 'Bridging the gap between rural patients and specialist doctors.',
    members: ['David Brown', 'Eva Green'],
    status: 'pending',
  },
  {
    id: '3',
    teamName: 'Gamma Rays',
    projectName: 'EduVR Platform',
    problematic: 'Making history lessons immersive using Virtual Reality.',
    members: ['Frank Wright', 'Grace Lee', 'Henry Wilson', 'Ivy Chen'],
    status: 'completed',
    scores: {
      innovation: 18,
      feasibility: 15,
      technical: 17
    },
    comments: {
      innovation: 'Excellent concept!',
      feasibility: 'Hardware costs might be high.',
      technical: 'Smooth execution.'
    }
  },
  {
    id: '4',
    teamName: 'Delta Force',
    projectName: 'AgriDrone',
    problematic: 'Automated crop monitoring for small-scale farmers.',
    members: ['Jack Power', 'Karen Hope'],
    status: 'completed',
    scores: {
      innovation: 14,
      feasibility: 19,
      technical: 16
    }
  },
];
