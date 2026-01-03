import React, { ReactNode } from "react";

export interface JobOptions {
  title: string;
  responsibilities: string;
  why: string;
}

export interface SkillsToLearn {
  title: string;
  why: string;
  how: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillsToLearn[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}

export interface CareerGuideResponse {
  summary: string;
  jobOptions: JobOptions[];
  skillsToLearn: SkillCategory[];
  learningApproach: LearningApproach;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profile_pic: string | null;
  profile_pic_public_id: string | null;
  skills: string[];
  subscription: string | null;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  btnLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setBtnLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AppProviderProps {
  children: ReactNode;
}
