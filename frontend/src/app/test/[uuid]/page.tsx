'use client';
import React, {useState, useEffect} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Link from "next/link";
import QuestionItem from "@/components/QuestionItem";
import {
    ArrowLeft,
    User,
    Brain,
    FileText, ChevronRight
} from 'lucide-react'

interface Answer {
    answerId: number;
    answerText: string | null;
}

interface SubQuestion {
    subQuestionText: string;
    subQuestionType: string;
    answers: Answer[];
}

interface Question {
    questionText: string;
    subQuestions: SubQuestion[];
}

interface ModuleData {
    moduleId: number;
    moduleQuestions: Question[];
}

interface FormattedAnswers {
    height: number;
    weight: number;
    selectedAnswerIds: number[];
}

interface TestResult {
    created_at: string;
    patient_name: string;
    patient_birth_date: string;
    patient_phone_number: string;
    recommendation_for_user: string[];
    nfr_points: number;
    kfr_points: number;
    symptoms_points: number;
    height: number;
    weight: number;
    gestures_result: number | null;
}

export default function CombinedModule() {
    const pathname = usePathname();
    const router = useRouter();
    const uuid = pathname.split('/').pop();
    const [moduleData, setModuleData] = useState<ModuleData[]>([]);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
    const [height, setHeight] = useState<number | null>(null);
    const [weight, setWeight] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [showTest, setShowTest] = useState(false);

    useEffect(() => {
        const checkTestResult = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/test_result/${uuid}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch test result');
                }
                const data = await response.json();
                if (data.message === "Created") {
                    setShowTest(true);
                    fetchModuleData();
                } else {
                    setTestResult(data);
                    setShowTest(false);
                }
            } catch (err) {
                console.error('Error checking test result:', err);
                setError('Failed to load test. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        if (uuid) {
            checkTestResult();
        }
    }, [uuid]);

    const fetchModuleData = () => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get_test/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch module data');
                }
                return response.json();
            })
            .then(data => {
                setModuleData(data);
            })
            .catch(err => {
                console.error('Error fetching module data:', err);
                setError('Failed to load questions. Please try again later.');
            });
    };

    const handleAnswer = (questionId: string, answer: number | number[] | string) => {
        setAnswers(prev => {
            const newAnswers = {...prev, [questionId]: answer};
            console.log(JSON.stringify(formatAnswers(newAnswers), null, 2));
            return newAnswers;
        });
    };

    const handleHeightChange = (value: number) => {
        setHeight(value);
    };

    const handleWeightChange = (value: number) => {
        setWeight(value);
    };

    const formatAnswers = (currentAnswers: Record<string, number | number[] | string>): FormattedAnswers => {
        const formatted: FormattedAnswers = {
            height: height || 0,
            weight: weight || 0,
            selectedAnswerIds: []
        };

        Object.entries(currentAnswers).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                formatted.selectedAnswerIds.push(...value);
            } else if (typeof value === 'number') {
                formatted.selectedAnswerIds.push(value);
            }
        });

        formatted.selectedAnswerIds = formatted.selectedAnswerIds.filter(id =>
            id !== formatted.height && id !== formatted.weight
        );

        formatted.selectedAnswerIds.sort((a, b) => a - b);

        return formatted;
    };

    const handleNext = () => {
        const currentModule = moduleData[currentModuleIndex];
        if (currentQuestionIndex < currentModule.moduleQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (currentModuleIndex < moduleData.length - 1) {
            setCurrentModuleIndex(currentModuleIndex + 1);
            setCurrentQuestionIndex(0);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (currentModuleIndex > 0) {
            setCurrentModuleIndex(currentModuleIndex - 1);
            setCurrentQuestionIndex(moduleData[currentModuleIndex - 1].moduleQuestions.length - 1);
        }
    };

    const handleSubmit = () => {
        const formattedAnswers = formatAnswers(answers);
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/submit/${uuid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedAnswers),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit answers');
                }
                return response.json();
            })
            .then(data => {
                console.log('Submission successful:', data);
                router.push(`/test-1/${uuid}`); // Redirect to the /test-1 page
            })
            .catch(err => {
                console.error('Error submitting answers:', err);
                alert('Failed to submit answers. Please try again.');
            });
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#12375F]"></div>
        </div>
    );

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#12375F]"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-xl sm:text-2xl font-bold text-[#12375F] mb-4">Error</h1>
                <p className="text-gray-700">{error}</p>
            </div>
        </div>
    );

    if (!showTest && testResult) {
        return (
            <div className="min-h-screen p-4 sm:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8">
                        <div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Результаты
                                тестирования</h1>
                            <Link
                                href="/doctor"
                                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2"/>
                                Назад
                            </Link>
                        </div>

                        {/* Patient Info */}
                        <div className="mb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                                <User className="w-6 h-6 mr-2 text-blue-600"/>
                                Информация о пациенте
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                                <p><span className="font-semibold">Имя:</span> {testResult.patient_name}</p>
                                <p><span
                                    className="font-semibold">Дата рождения:</span> {new Date(testResult.patient_birth_date).toLocaleDateString()}
                                </p>
                                <p><span className="font-semibold">Рост:</span> {testResult.height} см</p>
                                <p><span className="font-semibold">Вес:</span> {testResult.weight} кг</p>
                                <p><span className="font-semibold">Телефон:</span> {testResult.patient_phone_number}</p>
                                <p><span
                                    className="font-semibold">Дата теста:</span> {new Date(testResult.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Key Results */}
                        <div className="mb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                                <Brain className="w-6 h-6 mr-2 text-blue-600"/>
                                Ключевые показатели
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Оценка по
                                        факторам риска</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{testResult.kfr_points}%</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <p className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Очки
                                        симптомов</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{testResult.symptoms_points}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <p className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Когнитивный
                                        тест</p>
                                    {testResult.gestures_result !== null ? (
                                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">{testResult.gestures_result}/18</p>
                                    ) : (
                                        <Link
                                            href={`/test-1/${uuid}`}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        >
                                            Пройти когнитивный тест
                                            <ChevronRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true"/>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="mb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 flex items-center">
                                <FileText className="w-6 h-6 mr-2 text-blue-600"/>
                                Рекомендации
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Для
                                        пациента</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        {testResult.recommendation_for_user.map((recommendation, index) => (
                                            <li key={index}>{recommendation}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (showTest && moduleData.length > 0) {
        const currentModule = moduleData[currentModuleIndex];
        const currentQuestion = currentModule.moduleQuestions[currentQuestionIndex];
        const isLastQuestion = currentModuleIndex === moduleData.length - 1 && currentQuestionIndex === currentModule.moduleQuestions.length - 1;

        return (
            <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto rounded-lg">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[#12375F]">{currentQuestion.questionText}</h1>
                    {currentQuestion.subQuestions.map((subQuestion, index) => {
                        const questionId = `${currentModuleIndex}-${currentQuestionIndex}-${index}`;
                        return (
                            <QuestionItem
                                key={questionId}
                                question={{
                                    id: questionId,
                                    text: subQuestion.subQuestionText || subQuestion.subQuestionType
                                }}
                                onAnswer={handleAnswer}
                                type={subQuestion.subQuestionType}
                                answers={subQuestion.answers}
                                currentAnswer={answers[questionId]}
                                onHeightChange={handleHeightChange}
                                onWeightChange={handleWeightChange}
                                height={height}
                                weight={weight}
                            />
                        );
                    })}
                    <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentModuleIndex === 0 && currentQuestionIndex === 0}
                            className="w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-full text-[#12375F] font-semibold disabled:opacity-50 hover:bg-gray-300 transition-colors"
                        >
                            Назад
                        </button>
                        {isLastQuestion ? (
                            <button
                                onClick={handleSubmit}
                                className="w-full sm:w-auto px-6 py-3 bg-[#12375F] text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Перейти к тесту с жестами
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={currentModuleIndex === moduleData.length - 1 && currentQuestionIndex === currentModule.moduleQuestions.length - 1}
                                className="w-full sm:w-auto px-6 py-3 bg-[#12375F] text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Далее
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}