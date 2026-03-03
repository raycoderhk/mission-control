"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!session) {
        router.push("/");
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign Out</h1>
                <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
                
                <div className="flex gap-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        Sign Out
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
