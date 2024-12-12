'use client'
import React, {useState, useEffect} from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center justify-center font-extrabold" prefetch={false}>
                <span>ai.qutty.net</span>
            </Link>
            <div className="ml-auto">
                {isLoggedIn ? (
                    <Link className="bg-[#12375F] text-white px-4 py-2 rounded" href={"/doctor"}>
                        Кабинет
                    </Link>
                ) : (
                    <button className="bg-[#12375F] text-white px-4 py-2 rounded" onClick={openModal}>
                        Вход
                    </button>
                )}
            </div>
            {isModalOpen && <LoginModal onClose={closeModal} onLogin={() => setIsLoggedIn(true)}/>}
        </header>
    );
}
