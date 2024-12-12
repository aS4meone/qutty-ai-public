'use client';
import React, {useRef, useState, useEffect} from 'react';
import Webcam from 'react-webcam';
import {Loader} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {GESTURE_IMAGES, GESTURES} from "@/lib/gestures";
import {usePathname} from "next/navigation";

const shuffleGestures = (): string[] => {
    return GESTURES.sort(() => 0.5 - Math.random()).slice(0, 5);
};

const FourthTest: React.FC = () => {
    const pathname = usePathname();
    const uuid = pathname.split('/').pop();
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentGestures, setCurrentGestures] = useState<string[]>([]);
    const [currentGestureIndex, setCurrentGestureIndex] = useState<number | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [showDescription, setShowDescription] = useState(true);
    const [showWebcam, setShowWebcam] = useState(true);
    const [promptText, setPromptText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showInstruction, setShowInstruction] = useState(false);
    const [resultUrl, setResultUrl] = useState("");

    useEffect(() => {
        if (uuid) {
            const token = localStorage.getItem('token');
            setResultUrl(token ? `/doctor/${uuid}` : `/test/${uuid}`);
        }
    }, [uuid]);


    const startCapture = async () => {
        setCapturing(true);
        setShowDescription(false);
        setShowWebcam(false);

        const gestures = shuffleGestures();
        setCurrentGestures(gestures);

        for (let i = 0; i < gestures.length; i++) {
            setCurrentGestureIndex(i);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        setCurrentGestureIndex(null);
        setCurrentGestures([]);
        setShowWebcam(true);
        await captureSequence(gestures);
    };

    const captureSequence = async (gestures: string[]) => {
        const images: string[] = [];
        const capturedGestures: string[] = [];

        setShowWebcam(true);

        for (let i = 3; i > 0; i--) {
            setPromptText(`Приготовьтесь: ${i}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const captureGesture = async (index: number, gestureNumber: number) => {
            setPromptText(`Покажите жест номер ${gestureNumber}`);
            if (gestureNumber == 3) {
                setPromptText(`Теперь покажите жест номер ${gestureNumber}`);
            }
            setCountdown(5);
            for (let i = 5; i > 0; i--) {
                setCountdown(i);
                if (webcamRef.current) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        images.push(imageSrc);
                        capturedGestures.push(gestures[index]);
                        console.log(`Captured gesture ${gestureNumber}: ${gestures[index]}, countdown: ${i}`);
                    }
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setCountdown(null);
            setPromptText(null);
        };

        await captureGesture(4, 5); // Gesture 5
        await captureGesture(2, 3); // Gesture 3

        setCurrentGestureIndex(null);
        setCapturing(false);
        sendToBackend(capturedGestures, images);
    };

    const sendToBackend = async (gestures: string[], images: string[]) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("test_number", "4");
        formData.append('gesture_names', gestures.join(','));
        formData.append('strict', "1");
        formData.append('group_size', "5");

        images.forEach((image, index) => {
            const byteString = atob(image.split(',')[1]);
            const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], {type: mimeString});
            formData.append('images', blob, `image${index}.png`);
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/classify-gestures/${uuid}`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
        setLoading(false);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            {showInstruction ? (
                <>
                    <div className="flex justify-center">
                        <Image src={`/gifs/second.gif`} alt={`f`} width={400} height={400} className="center"/>
                    </div>
                    <button
                        onClick={() => setShowInstruction(false)}
                        className="px-4 py-2 mt-3 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]"
                    >
                        Закрыть инструкцию
                    </button>
                </>
            ) : (
                <>
                    {showWebcam && (
                        <Webcam ref={webcamRef} screenshotFormat="image/png"
                                className="mx-auto mb-4 rounded-lg shadow-lg lg:max-w-xl max-w-60 -scale-x-100"/>
                    )}
                    {showDescription && (
                        <div
                            className="description mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 text-xl max-w-xl">
                            <p>Запомните порядок жестов. Позже покажите жест по порядковому номеру</p>
                        </div>
                    )}
                    <div className="flex justify-center mt-3 space-x-3 max-w-xl mx-auto">
                        <button
                            onClick={startCapture}
                            disabled={capturing}
                            className={`px-16 py-2 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
                        >
                            Start
                        </button>
                        <button
                            onClick={() => setShowInstruction(true)}
                            className={`px-8 py-2 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed hidden' : 'bg-white text-black'}`}
                        >
                            Инструкция
                        </button>
                    </div>
                    {currentGestureIndex !== null && currentGestures.length > 0 && (
                        <div className="text-4xl font-bold mt-6 text-gray-800">
                            <Image
                                src={`/gestures/${GESTURE_IMAGES[currentGestures[currentGestureIndex]]}`}
                                alt={currentGestures[currentGestureIndex]}
                                width={200}
                                height={200}
                                className="mx-auto w-[200px] h-[200px] object-contain"
                            />
                            <h2>Жест {currentGestureIndex + 1}</h2>
                        </div>
                    )}
                    {promptText && (
                        <div className="text-4xl mt-6 text-gray-800">
                            {promptText}
                        </div>
                    )}
                    {countdown !== null && (
                        <div className="text-2xl mt-6 text-gray-800">
                            Отсчет: {countdown}
                        </div>
                    )}
                    {loading && (
                        <div className="flex flex-col items-center justify-center mt-6 text-gray-800">
                            <Loader className="w-12 h-12 animate-spin mb-4"/>
                            <p className="text-xl">Отправка результатов...</p>
                            <p className="text-sm mt-2">Это может занять до 30 секунд</p>
                            <p className="text-sm mt-2">Все тесты пройдены</p>
                        </div>
                    )}
                    {results && (
                        <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                            <Link href={resultUrl}
                                  className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                            >
                                Результаты
                            </Link>
                            <p className="font-semibold mt-4">Результаты сохранены. Вы можете посмотреть их нажав кнопку
                                Выше</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FourthTest;