import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeProfile } from './../../types';

interface AuthContextType {
    judgeProfile: JudgeProfile | null;
    setJudgeProfile: (profile: JudgeProfile | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const navigate = useNavigate();
    const [judgeProfile, setJudgeProfile] = useState<JudgeProfile | null>(() => {
        try {
            const storedProfile = localStorage.getItem("judgeProfile");
            return storedProfile ? JSON.parse(storedProfile) : null;
        } catch (e) {
            console.error("Failed to parse judgeProfile from local storage", e);
            return null;
        }
    });

    useEffect(() => {
        if (judgeProfile) {
            localStorage.setItem("judgeProfile", JSON.stringify(judgeProfile));
        } else {
            localStorage.removeItem("judgeProfile");
             // Add check for immediate redirection upon programmatic logout (setting to null)
             if (!judgeProfile && window.location.hash !== '#/') {
                 navigate('/');
             }
        }
    }, [judgeProfile, navigate]);

    const logout = () => {
        setJudgeProfile(null);
        navigate('/');
    };

    const isAuthenticated = !!judgeProfile?.id;

    // Correctly structured JSX return block
    return (
        <AuthContext.Provider value={{ judgeProfile, setJudgeProfile, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    ); 
}; // The closing brace for the AuthProvider component

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};