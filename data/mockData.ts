import { Project } from "../types";

export const mockProjects: Project[] = [
  {
    id: "1",
    teamName: "Team Alpha",
    name: "Eco-Harvest",
    problematic: "Food wastage in urban areas due to supply chain inefficiencies.",
    teamMembers: ["Alice Johnson", "Bob Smith", "Carol White"],
    status: "pending"
  },
  {
    id: "2",
    teamName: "Team Beta",
    name: "Neural Nexus",
    problematic: "Lack of accessible AI interfaces for elderly populations.",
    teamMembers: ["David Brown", "Eve Davis"],
    status: "completed",
    scores: {
      innovation: 18,
      feasibility: 15,
      technical: 19
    },
    comments: {
        innovation: "Excellent use of tech.",
        feasibility: "Needs more market research.",
        technical: "Clean architecture."
    }
  },
  {
    id: "3",
    teamName: "Team Gamma",
    name: "Aqua Pure",
    problematic: "Contaminated water sources in remote villages.",
    teamMembers: ["Frank Miller", "Grace Wilson", "Henry Moore"],
    status: "pending"
  },
  {
    id: "4",
    teamName: "Team Delta",
    name: "Smart Grid",
    problematic: "Energy consumption optimization in residential buildings.",
    teamMembers: ["Ivy Taylor", "Jack Anderson"],
    status: "completed",
     scores: {
      innovation: 12,
      feasibility: 14,
      technical: 10
    }
  },
   {
    id: "5",
    teamName: "Team Epsilon",
    name: "MediTrack",
    problematic: "Counterfeit medication tracking in supply chains.",
    teamMembers: ["Kevin Thomas", "Laura Martinez"],
    status: "pending"
  }
];
