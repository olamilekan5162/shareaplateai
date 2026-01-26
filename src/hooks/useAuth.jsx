import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0],
          role: session.user.user_metadata?.role || "recipient",
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0],
          role: session.user.user_metadata?.role || "recipient",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
      role: data.user.user_metadata?.role || "recipient",
    };

    setUser(userData);
    return userData;
  };

  const register = async (email, password, name, role, location) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, location },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) throw error;

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required - don't create profile yet
      return null;
    }

    if (data.user && data.session) {
      // User is confirmed, create profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name: name,
          role: role,
          location: location,
        },
      ]);

      // Log error but don't throw - trigger might have already created it
      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Only throw if it's not a duplicate key error
        if (
          !profileError.message.includes("duplicate") &&
          !profileError.message.includes("already exists")
        ) {
          throw profileError;
        }
      }

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || name,
        role: data.user.user_metadata?.role || role,
        location: data.user.user_metadata?.location || location,
      };
      setUser(userData);
      return userData;
    }

    return null;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
