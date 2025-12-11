"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useAccount } from "wagmi";

interface User {
    walletAddress: string;
    isVerified: boolean;
    worldIdNullifier?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    walletAddress: string | null;
    signIn: () => Promise<void>;
    signOut: () => void;
    setVerified: (nullifierHash: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data when wallet connects
    useEffect(() => {
        async function loadUser() {
            if (isConnected && address) {
                setIsLoading(true);
                try {
                    // Check if user exists in local storage or create new
                    const storedUser = localStorage.getItem(`user_${address.toLowerCase()}`);
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        const newUser: User = {
                            walletAddress: address.toLowerCase(),
                            isVerified: false,
                        };
                        setUser(newUser);
                        localStorage.setItem(`user_${address.toLowerCase()}`, JSON.stringify(newUser));
                    }
                } catch (error) {
                    console.error("Error loading user:", error);
                    setUser(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setUser(null);
                setIsLoading(false);
            }
        }

        loadUser();
    }, [address, isConnected]);

    const signIn = useCallback(async () => {
        if (!address) return;

        setIsLoading(true);
        try {
            const newUser: User = {
                walletAddress: address.toLowerCase(),
                isVerified: false,
            };
            setUser(newUser);
            localStorage.setItem(`user_${address.toLowerCase()}`, JSON.stringify(newUser));
        } catch (error) {
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    const signOut = useCallback(() => {
        setUser(null);
    }, []);

    const setVerified = useCallback((nullifierHash: string) => {
        if (user) {
            const updatedUser: User = {
                ...user,
                isVerified: true,
                worldIdNullifier: nullifierHash,
            };
            setUser(updatedUser);
            localStorage.setItem(`user_${user.walletAddress}`, JSON.stringify(updatedUser));
        }
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: isConnected && !!address,
                walletAddress: address?.toLowerCase() || null,
                signIn,
                signOut,
                setVerified,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthProvider;
