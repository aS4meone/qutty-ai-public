'use client';
import React, {useRef, useState} from 'react';
import {Loader} from "lucide-react";
import Webcam from 'react-webcam';
import Link from 'next/link';
import Image from 'next/image';
import {GESTURE_IMAGES, SHAPE_IMAGES} from '@/lib/gestures';
import {usePathname} from "next/navigation";

const GESTURES = ['dislike', 'like', 'rock', 'ok', 'peace', 'one', 'palm'];

const SHAPES = [
    'black_circle',
    'black_square',
    'black_star',
    'black_triangle',
    'white_circle',
    'white_square',
    'white_star',
    'white_triangle',
];

const getRandomShapes = () => {
    const shapesCopy = [...SHAPES];
    return shapesCopy.sort(() => 0.5 - Math.random()).slice(0, 2);
};

const getRandomGestures = () => {
    const gesturesCopy = [...GESTURES];
    return gesturesCopy.sort(() => 0.5 - Math.random()).slice(0, 2);
};

const generateShapeSequence = (selectedShapes: any) => {
    const incorrectShapes = SHAPES.filter(shape => !selectedShapes.includes(shape));

    const pattern = [
        {correct: 0, incorrect: 2},
        {correct: 1, incorrect: 0},
        {correct: 0, incorrect: 3},
        {correct: 1, incorrect: 0},
        {correct: 0, incorrect: 4},
        {correct: 1, incorrect: 0},
        {correct: 0, incorrect: 3},
        {correct: 1, incorrect: 0},
        {correct: 0, incorrect: 2},
        {correct: 1, incorrect: 0},
        {correct: 0, incorrect: 3},
        {correct: 1, incorrect: 0}
    ];

    let shapeCount = {[selectedShapes[0]]: 0, [selectedShapes[1]]: 0};
    let combinedShapes: any = [];

    pattern.forEach(step => {
        for (let i = 0; i < step.incorrect; i++) {
            combinedShapes.push(incorrectShapes[Math.floor(Math.random() * incorrectShapes.length)]);
        }

        if (step.correct > 0) {
            let correctShape = null;
            if (shapeCount[selectedShapes[0]] < 3 && shapeCount[selectedShapes[1]] < 3) {
                correctShape = selectedShapes[Math.floor(Math.random() * 2)];
            } else {
                correctShape = shapeCount[selectedShapes[0]] < 3 ? selectedShapes[0] : selectedShapes[1];
            }

            combinedShapes.push(correctShape);
            shapeCount[correctShape]++;
        }
    });

    return combinedShapes;
};

const ThirdTest: React.FC = () => {
    const pathname = usePathname();
    const uuid = pathname.split('/').pop();
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentShape, setCurrentShape] = useState<string | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [shapesGestures, setShapesGestures] = useState<{ [key: string]: string }>({});
    const [showDescription, setShowDescription] = useState(true);
    const [shapeGestureDescription, setShapeGestureDescription] = useState<{
        shape1: string;
        gesture1: string;
        shape2: string;
        gesture2: string
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [showInstruction, setShowInstruction] = useState(false);

    const startCapture = () => {
        const selectedShapes = getRandomShapes();
        const selectedGestures = getRandomGestures();
        const newShapesGestures: { [key: string]: string } = {};
        selectedShapes.forEach((shape, index) => {
            newShapesGestures[shape] = selectedGestures[index];
        });
        setShapesGestures(newShapesGestures);
        setShapeGestureDescription({
            shape1: selectedShapes[0],
            gesture1: selectedGestures[0],
            shape2: selectedShapes[1],
            gesture2: selectedGestures[1]
        });
        setCapturing(true);
        setShowDescription(false);
        captureSequence(newShapesGestures);
    };

    const captureSequence = async (shapesGestures: { [key: string]: string }) => {
        const images: string[] = [];
        const gestureOrder: string[] = [];
        const allShapes = Object.keys(shapesGestures);
        const shapeSequence = generateShapeSequence(allShapes);
        const shapeCount: { [key: string]: number } = {[allShapes[0]]: 0, [allShapes[1]]: 0};

        for (let i = 5; i > 0; i--) {
            setCountdown(i);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);
        setShapeGestureDescription(null);

        for (let i = 0; i < shapeSequence.length; i++) {
            const currentShape = shapeSequence[i];
            setCurrentShape(currentShape);

            if (allShapes.includes(currentShape)) {
                shapeCount[currentShape]++;
                if (shapeCount[currentShape] > 3) {
                    continue;
                }

                for (let j = 2; j >= 0; j--) {
                    setCountdown(j === 0 ? null : j);
                    if (webcamRef.current) {
                        const imageSrc = webcamRef.current.getScreenshot();
                        if (imageSrc) {
                            images.push(imageSrc);
                            gestureOrder.push(shapesGestures[currentShape]);
                            console.log(`Captured gesture for shape ${currentShape}, countdown: ${j}`);
                        }
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                if (shapeCount[allShapes[0]] >= 3 && shapeCount[allShapes[1]] >= 3) {
                    break;
                }
            } else {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        setCurrentShape(null);
        setCapturing(false);
        sendToBackend(gestureOrder, images);
    };

    const sendToBackend = async (gestureOrder: string[], images: string[]) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("test_number", "3");
        formData.append('gesture_names', gestureOrder.join(','));
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
                        <Image src={`/gifs/fourth.gif`} alt={`fsasfsa`} width={400} height={400} className="center"/>
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
                            className={`mx-auto mb-4 rounded-lg shadow-lg lg:max-w-xl max-w-60 -scale-x-100 ${shapeGestureDescription ? 'hidden' : 'block'}`}/>
                    {showDescription && (
                        <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                            <p>Запомните две фигуры и жесты за 5 секунд. Затем на экране будут появляться разные
                                фигуры. <br/> Ваша задача — показать нужный жест, когда появится соответствующая фигура.
                            </p>
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
                    {shapeGestureDescription && (
                        <div className="flex flex-col items-center mt-4">
                            <div className="flex items-center mb-4">
                                <Image src={`/figures/${SHAPE_IMAGES[shapeGestureDescription.shape1]}`}
                                       alt={shapeGestureDescription.shape1} width={200} height={200}
                                       className="mx-auto w-[200px] h-[200px] object-contain"
                                />
                                <span className="mx-2"> - </span>
                                <Image src={`/gestures/${GESTURE_IMAGES[shapeGestureDescription.gesture1]}`}
                                       alt={shapeGestureDescription.gesture1} width={200} height={200}
                                       className="mx-auto w-[200px] h-[200px] object-contain"
                                />
                            </div>
                            <div className="flex items-center">
                                <Image src={`/figures/${SHAPE_IMAGES[shapeGestureDescription.shape2]}`}
                                       alt={shapeGestureDescription.shape2} width={200} height={200}
                                       className="mx-auto w-[200px] h-[200px] object-contain"
                                />
                                <span className="mx-2"> - </span>
                                <Image src={`/gestures/${GESTURE_IMAGES[shapeGestureDescription.gesture2]}`}
                                       alt={shapeGestureDescription.gesture2} width={200} height={200}
                                       className="mx-auto w-[200px] h-[200px] object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {currentShape && (
                        <div style={{fontSize: '2rem', margin: '1rem'}}>
                            <Image
                                src={`/figures/${SHAPE_IMAGES[currentShape]}`}
                                alt={currentShape}
                                width={200}
                                height={200}
                                className="mx-auto w-[200px] h-[200px] object-contain"

                            />
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
                        <div
                            className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                            <Link href={`/test-4/${uuid}`}
                                  className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                            >
                                Далее
                            </Link>
                            <p className="font-semibold mt-4">Результаты сохранены. Вы можете перейти к следующему
                                тесту.
                                Или вы можете начать тест заново, нажав на кнопку Start выше</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ThirdTest;