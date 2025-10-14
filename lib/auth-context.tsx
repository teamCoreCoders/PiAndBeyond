"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useRouter } from "next/navigation";

interface UserData {
  uid: string;
  email: string;
  role: "teacher" | "student";
  name: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        // Support env-based teacher override without Firebase user
        try {
          const override =
            typeof window !== "undefined"
              ? sessionStorage.getItem("teacherOverride")
              : null;
          if (override === "true") {
            const email =
              sessionStorage.getItem("teacherOverrideEmail") ||
              "teacher@example.com";
            const name =
              sessionStorage.getItem("teacherOverrideName") || "Teacher";
            setUserData({ uid: "env-teacher", email, role: "teacher", name });
          } else {
            setUserData(null);
          }
        } catch {
          setUserData(null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
