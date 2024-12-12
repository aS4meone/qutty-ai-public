import React, {useEffect, FC, useState} from "react";
import {useRouter} from "next/navigation";

interface TestModalProps {
    onClose: () => void;
}

const TestModal: FC<TestModalProps> = ({onClose}) => {
    const [name, setName] = useState("");
    const [moca, setMoca] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [showMoca, setShowMoca] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleContentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name) {
            setValidationMessage("Please fill in the name field.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("gender", gender);
        formData.append("age", age);
        if (moca) formData.append("moca", moca);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diagnosis`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("id", data.id.toString());
                router.push("/test-1");
            } else {
                console.error("Error submitting the form");
            }
        } catch (error) {
            console.error("Error submitting the form", error);
        }
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setAge(value);
            if (validationMessage) setValidationMessage("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <form className="w-full max-w-lg p-6 bg-[hsl(210_100%_97%)] shadow-lg rounded-xl"
                  onClick={handleContentClick} onSubmit={handleSubmit}>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Информация</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <label htmlFor="name" className="w-1/4 text-right mr-4">
                            Имя
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (validationMessage) setValidationMessage("");
                            }}
                            placeholder="Введите имя"
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="gender" className="w-1/4 text-right mr-4">
                            Пол
                        </label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => {
                                setGender(e.target.value);
                                if (validationMessage) setValidationMessage("");
                            }}
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        >
                            <option value="" disabled>Выберите пол</option>
                            <option value="Male">Мужчина</option>
                            <option value="Female">Женщина</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="age" className="w-1/4 text-right mr-4">
                            Возраст
                        </label>
                        <input
                            id="age"
                            type="text"
                            value={age}
                            onChange={handleAgeChange}
                            placeholder="Введите возраст"
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        />
                    </div>
                    {showMoca && (
                        <div className="flex items-center">
                            <label htmlFor="moca" className="w-1/4 text-right mr-4">
                                Moca Test
                            </label>
                            <input
                                id="moca"
                                type="text"
                                value={moca}
                                onChange={(e) => {
                                    setMoca(e.target.value);
                                    if (validationMessage) setValidationMessage("");
                                }}
                                placeholder="Введите балл мока теста"
                                className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                            />
                        </div>
                    )}
                </div>
                {validationMessage && (
                    <div className="mt-4 text-red-500 text-center">
                        {validationMessage}
                    </div>
                )}
                {!showMoca && (
                    <div className="mt-4 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setShowMoca(true)}
                            className="font-semibold text-blue-500 rounded hover:text-blue-900"
                        >
                            + Добавить балл MoCa теста
                        </button>
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)] rounded hover:bg-[hsl(308_56%_75%)]"
                    >
                        Начать тест
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestModal;
