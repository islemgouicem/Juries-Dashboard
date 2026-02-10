import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { JudgeProfile } from "../../types";
import { supabase } from "../lib/supabase";

interface AuthContextValue {
    isAuthenticated: boolean;
    loading: boolean;
    judgeProfile: JudgeProfile | null;
    login: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [judgeProfile, setJudgeProfile] = useState<JudgeProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const hydrateProfile = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            setIsAuthenticated(false);
            setJudgeProfile(null);
            setLoading(false);
            return;
        }

        const userId = session.user.id;
        const { data: profile } = await supabase
            .from("profiles_1")
            .select("id, full_name, email, is_admin, type")
            .eq("id", userId)
            .maybeSingle();

        if (profile) {
            setJudgeProfile({
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                isAdmin: !!profile.is_admin,
                type: profile.type || null,
            });
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setJudgeProfile(null);
        }
        setLoading(false);
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        await hydrateProfile();
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setJudgeProfile(null);
    };

    useEffect(() => {
        hydrateProfile();
        const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
            hydrateProfile();
        });
        return () => {
            sub.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, judgeProfile, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};