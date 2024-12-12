'use client';
import React, {useRef, useState} from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";
import Image from 'next/image';
import {GESTURE_IMAGES, shuffleGestures} from "@/lib/gestures";
import {usePathname} from 'next/navigation';
import {Loader} from "lucide-react";

const FirstTest: React.FC = () => {
    const pathname = usePathname();
    const uuid = pathname.split('/').pop();
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentGesture, setCurrentGesture] = useState<string | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [showDescription, setShowDescription] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showInstruction, setShowInstruction] = useState(false);

    const startCapture = () => {
        setCapturing(true);
        setShowDescription(false);
        captureSequence();
    };

    const captureSequence = async () => {
        const gestures = shuffleGestures();
        const images: string[] = [];
        const gestureMapping: string[] = [];

        for (const gesture of gestures) {
            setCurrentGesture(gesture);

            for (let i = 3; i > 0; i--) {
                setCountdown(i);
                if (webcamRef.current) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        images.push(imageSrc);
                        gestureMapping.push(gesture);
                        console.log(`Captured ${gesture} at ${i} seconds`);
                    }
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setCountdown(null);
        }
        setCurrentGesture(null);
        setCapturing(false);
        sendToBackend(gestureMapping, images);
    };

    const sendToBackend = async (gestures: string[], images: string[]) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("test_number", "1");
        formData.append('gesture_names', gestures.join(','));
        formData.append('strict', "1");
        formData.append('group_size', "3");


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
                        <Image src={`/gifs/first.gif`} alt={`fafa`} width={400} height={400} className="center"/>
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
                    <Webcam ref={webcamRef} screenshotFormat="image/png"
                            className="mx-auto rounded-lg shadow-lg lg:max-w-xl max-w-60 -scale-x-100"/>

                    {showDescription && (
                        <div className="text-xl mx-auto mt-4 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                            <p>Повторяйте жесты, которые вы увидите на экране.</p>
                            <p className="font-bold">Жесты можно показывать любой рукой.</p>
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

                    {currentGesture && (
                        <div className="text-2xl text-gray-800">
                            <Image
                                src={`/gestures/${GESTURE_IMAGES[currentGesture]}`}
                                alt={currentGesture}
                                width="200"
                                height="200"
                                className="mx-auto w-[200px] h-[200px] object-contain"
                            />
                        </div>
                    )}

                    {countdown !== null && (
                        <div className="text-4xl mt-6 text-gray-800">
                            Отсчет: {countdown}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center mt-6 text-gray-800">
                            <Loader className="w-12 h-12 animate-spin mb-4"/>
                            <p className="text-xl">Отправка результатов...</p>
                            <p className="text-sm mt-2">Это может занять до 30 секунд</p>
                        </div>
                    )}

                    {results && (
                        <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                            <Link href={`/test-2/${uuid}`}
                                  className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}>
                                Далее
                            </Link>
                            <p className="font-semibold mt-4">Результаты сохранены. Вы можете перейти к следующему
                                тесту. Или вы можете начать тест заново, нажав на кнопку Start выше</p>
                        </div>
                    )}
                </>

            )}
        </div>
    );

};

export default FirstTest;
