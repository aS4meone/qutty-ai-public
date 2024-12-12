import React, {useState} from "react";
import {useRouter} from "next/navigation";

interface LoginModalProps {
    onClose: () => void;
    onLogin: () => void;
}

export default function LoginModal({onClose, onLogin}: LoginModalProps) {
    const router = useRouter()
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleModalClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();  // Only close if clicked outside the modal content
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
            });

            if (!response.ok) {
                throw new Error("Failed to log in");
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            onLogin();
            onClose();
            router.push("/doctor")
        } catch (error) {
            setError("Login failed, please try again.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
             onClick={handleModalClick}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-80" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-[#12375F] text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Login
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
