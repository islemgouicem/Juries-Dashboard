import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { JudgeProfile } from "../../types";

interface AuthContextValue {
    isAuthenticated: boolean;
    loading: boolean;
    judgeProfile: JudgeProfile | null;
    themeIds: string[];
    login: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [judgeProfile, setJudgeProfile] = useState<JudgeProfile | null>(null);
    const [themeIds, setThemeIds] = useState<string[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const hydrateProfile = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            setIsAuthenticated(false);
            setJudgeProfile(null);
            setThemeIds([]);
            setLoading(false);
            return;
        }

        const userId = session.user.id;
        const { data: profile } = await supabase
            .from("profiles_1")
            .select("id, full_name, email, is_admin")
            .eq("id", userId)
            .maybeSingle();

        const { data: jt } = await supabase
            .from("jury_themes_1")
            .select("theme_id")
            .eq("jury_id", userId);

        if (profile) {
            setJudgeProfile({
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                isAdmin: !!profile.is_admin,
                themeIds: jt?.map((r) => r.theme_id) || [],
            });
            setThemeIds(jt?.map((r) => r.theme_id) || []);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setJudgeProfile(null);
            setThemeIds([]);
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
        setThemeIds([]);
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
        <AuthContext.Provider value={{ isAuthenticated, loading, judgeProfile, themeIds, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};