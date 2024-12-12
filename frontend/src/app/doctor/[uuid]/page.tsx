"use client"

import React, {useEffect, useState} from 'react'
import {usePathname} from 'next/navigation'
import Link from "next/link"
import {
    ArrowLeft,
    Clipboard,
    ChevronRight,
    Brain,
    FileText,
    User,
    AlertTriangle,
    BookOpen,
    ChevronDown,
    Download
} from 'lucide-react'
import {Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle} from 'docx';
import {saveAs} from 'file-saver';


interface TestResult {
    sp: string[]
    patient_name: string
    complaints: string[]
    nfr_points: number
    id: string
    recommendation_for_user: string[]
    kfr_points: number
    symptoms_points: number
    patient_birth_date: string
    recommendation_for_doctor: string[]
    height: number
    patient_phone_number: string
    weight: number
    created_at: string
    am: string[]
    status: string
    av: string[]
    gestures_result: number | null
    diagnosis: string | null
    degree: string | null
}

const diagnoses = [
    "Деменция",
    "Болезнь Альцгеймера",
    "Сосудистая деменция",
    "Умеренное когнитивное расстройство",
    "Деменция с тельцами Леви",
    "Лобно-височная деменция",
    "Болезнь Крейтцфельдта — Якоба",
    "Синдром Хакима-Адамса",
    "Другое"
];

const degrees = [
  "Легкая степень",
  "Умеренная степень",
  "Тяжелая степень"
]

export default function DementiaTestResult() {
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [isTestComplete, setIsTestComplete] = useState<boolean>(true);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
    const [selectedDegree, setSelectedDegree] = useState<string>("")
    const [customDiagnosis, setCustomDiagnosis] = useState<string>("");
    const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState<boolean>(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [successMessageDegree, setSuccessMessageDegree] = useState<string | null>(null);
    const pathname = usePathname();
    const uuid = pathname.split('/').pop();

    useEffect(() => {
        const fetchTestResult = async () => {
            const token = localStorage.getItem('access_token');

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/doctor/test-result/${uuid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch test result');
                }
                const data = await response.json();
                if (data.message === "Test is not complete") {
                    setIsTestComplete(false);
                } else {
                    setTestResult(data);
                    setSelectedDiagnosis(data.diagnosis || "");
                    setSelectedDegree(data.degree || "");
                    setIsTestComplete(true);
                }
            } catch (error) {
                console.error('Error fetching test result:', error);
            }
        }

        if (uuid) {
            fetchTestResult();
        }
    }, [uuid]);

    const saveDiagnosis = async () => {
        const token = localStorage.getItem('access_token');
        let diagnosisToSave = selectedDiagnosis;

        if (selectedDiagnosis === "Другое") {
            if (!customDiagnosis.trim()) {
                setError("Пожалуйста, введите диагноз или выберите из списка.");
                return;
            }
            diagnosisToSave = customDiagnosis.trim();
        }

        if (!diagnosisToSave) {
            setError("Пожалуйста, выберите диагноз или введите свой вариант.");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diagnosis/${uuid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({diagnosis: diagnosisToSave})
            });

            if (!response.ok) {
                throw new Error('Failed to save diagnosis');
            }

            setError("");
            setSuccessMessage("Диагноз успешно сохранен!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error saving diagnosis:', error);
            setError("Не удалось сохранить. Попробуйте еще раз.");
        }
    };

    const saveDegree = async () => {
        const token = localStorage.getItem('access_token')

        if (!selectedDegree) {
            setError("Пожалуйста, выберите степень болезни.")
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/degree/${uuid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({degree: selectedDegree})
            })

            if (!response.ok) {
                throw new Error('Failed to save degree')
            }

            setError("")
            setSuccessMessageDegree("Степень болезни успешно сохранена!")
            setTimeout(() => setSuccessMessageDegree(null), 3000)
        } catch (error) {
            console.error('Error saving degree:', error)
            setError("Не удалось сохранить. Попробуйте еще раз.")
        }
    }


    const copyTestLink = () => {
        const testLink = `https://ai.qutty.net/test/${uuid}/`
        navigator.clipboard.writeText(testLink)
            .then(() => alert('Ссылка на тест скопирована в буфер обмена'))
            .catch(err => console.error('Не удалось скопировать ссылку: ', err))
    }

    const generateDocx = async () => {
        if (!testResult) return;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Результаты тестирования Qutty AI",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: "Информация о пациенте",
                        heading: HeadingLevel.HEADING_1,
                        thematicBreak: true,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({text: `Имя: `, bold: true}),
                            new TextRun(`${testResult.patient_name}`),
                            new TextRun({text: `Дата рождения: `, bold: true, break: 1}),
                            new TextRun(`${new Date(testResult.patient_birth_date).toLocaleDateString()}`),
                            new TextRun({text: `Рост: `, bold: true, break: 1}),
                            new TextRun(`${testResult.height} см`),
                            new TextRun({text: `Вес: `, bold: true, break: 1}),
                            new TextRun(`${testResult.weight} кг`),
                            new TextRun({text: `Телефон: `, bold: true, break: 1}),
                            new TextRun(`${testResult.patient_phone_number}`),
                            new TextRun({text: `Дата теста: `, bold: true, break: 1}),
                            new TextRun(`${new Date(testResult.created_at).toLocaleString()}`),
                        ],
                    }),
                    new Paragraph({
                        text: "Ключевые показатели",
                        heading: HeadingLevel.HEADING_1,
                        thematicBreak: true,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({text: `Шанс развития деменции: `, bold: true}),
                            new TextRun({text: `${testResult.kfr_points}%`, color: "#FF0000"}),
                            new TextRun({text: `Очки симптомов: `, bold: true, break: 1}),
                            new TextRun(`${testResult.symptoms_points}`),
                            new TextRun({text: `Когнитивный тест: `, bold: true, break: 1}),
                            new TextRun(`${testResult.gestures_result !== null ? `${testResult.gestures_result}/18` : 'Не пройден'}`),
                            new TextRun({text: `Статус: `, bold: true, break: 1}),
                            new TextRun({text: `${testResult.status}`, highlight: "yellow"}),
                        ],
                    }),
                    new Paragraph({
                        text: "Рекомендации",
                        heading: HeadingLevel.HEADING_1,
                        thematicBreak: true,
                    }),
                    new Paragraph({
                        text: "Для врача",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...testResult.recommendation_for_doctor.map(rec =>
                        new Paragraph({
                            text: `• ${rec}`,
                            bullet: {level: 0},
                        })
                    ),
                    new Paragraph({
                        text: "Для пациента",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...testResult.recommendation_for_user.map(rec =>
                        new Paragraph({
                            text: `• ${rec}`,
                            bullet: {level: 0},
                        })
                    ),
                    new Paragraph({
                        text: "Жалобы и История болезни",
                        heading: HeadingLevel.HEADING_1,
                        thematicBreak: true,
                    }),
                    new Paragraph({
                        text: "Жалобы",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...testResult.complaints.map(complaint =>
                        new Paragraph({
                            text: `• ${complaint}`,
                            bullet: {level: 0},
                        })
                    ),
                    new Paragraph({
                        text: "Anamnesis Morbi",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...testResult.am.map(item =>
                        new Paragraph({
                            text: `• ${item}`,
                            bullet: {level: 0},
                        })
                    ),
                    new Paragraph({
                        text: "Anamnesis Vitae",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...testResult.av.map(item =>
                        new Paragraph({
                            text: `• ${item}`,
                            bullet: {level: 0},
                        })
                    ),
                    new Paragraph({
                        text: "Status Praesens",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    ...testResult.sp.map(symptom =>
                        new Paragraph({
                            text: `• ${symptom}`,
                            bullet: {level: 0},
                        })
                    ),
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Результаты ${testResult.patient_name}.docx`);
    };


    if (!isTestComplete) {
        return (
            <div className="min-h-screen p-4 sm:p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#12375F] mb-4 sm:mb-0">Тест не пройден</h1>
                        <Link
                            href="/doctor"
                            className="flex items-center text-[#12375F] hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2"/>
                            Назад
                        </Link>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3 mb-2 sm:mb-0"/>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Внимание: Тест еще
                                    не пройден</h2>
                                <p className="text-gray-700">Для получения результатов необходимо завершить тест. Вы
                                    можете продолжить тестирование прямо сейчас.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={`/test/${uuid}`}
                            className="bg-[#12375F] text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
                        >
                            Продолжить тест
                            <ChevronRight className="w-5 h-5 ml-2"/>
                        </Link>
                        <button
                            onClick={copyTestLink}
                            className="bg-white text-[#12375F] px-6 py-3 rounded-md hover:bg-gray-100 border border-[#12375F] transition-colors flex items-center justify-center"
                        >
                            <Clipboard className="w-5 h-5 mr-2"/>
                            Скопировать ссылку на тест
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!testResult) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Результаты
                            тестирования</h1>
                        <div
                            className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={generateDocx}
                                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <Download className="w-5 h-5 mr-2"/>
                                Скачать (.docx)
                            </button>
                            <Link
                                href="/doctor"
                                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2"/>
                                Назад
                            </Link>
                        </div>
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
                            <div className="col-span-1 sm:col-span-2">
                                <label htmlFor="diagnosis" className="block text-sm font-bold text-gray-700 mb-1">
                                    Диагноз
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="relative w-full sm:w-auto">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full sm:w-[300px] px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {selectedDiagnosis || "Выберите диагноз"}
                                            <ChevronDown
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2"/>
                                        </button>
                                        {isDropdownOpen && (
                                            <div
                                                className="absolute z-10 w-full sm:w-[300px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                                {diagnoses.map((diagnosis) => (
                                                    <button
                                                        key={diagnosis}
                                                        onClick={() => {
                                                            setSelectedDiagnosis(diagnosis);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    >
                                                        {diagnosis}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {selectedDiagnosis === "Другое" && (
                                        <input
                                            type="text"
                                            value={customDiagnosis}
                                            onChange={(e) => setCustomDiagnosis(e.target.value)}
                                            placeholder="Введите диагноз"
                                            className="w-full sm:w-[300px] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    )}
                                    <button
                                        onClick={saveDiagnosis}
                                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Сохранить
                                    </button>
                                </div>
                                {successMessage && (
                                    <div
                                        className="mt-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                                        {successMessage}
                                    </div>
                                )}
                            </div>
                            <div className="mb-8">
                                <label htmlFor="diagnosis" className="block text-sm font-bold text-gray-700 mb-1">
                                    Степень болезни
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="relative w-full sm:w-auto">
                                        <button
                                            onClick={() => setIsDegreeDropdownOpen(!isDegreeDropdownOpen)}
                                            className="w-full sm:w-[300px] px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {selectedDegree || "Выберите степень болезни"}
                                            <ChevronDown
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2"/>
                                        </button>
                                        {isDegreeDropdownOpen && (
                                            <div
                                                className="absolute z-10 w-full sm:w-[300px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                                {degrees.map((degree) => (
                                                    <button
                                                        key={degree}
                                                        onClick={() => {
                                                            setSelectedDegree(degree)
                                                            setIsDegreeDropdownOpen(false)
                                                        }}
                                                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    >
                                                        {degree}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={saveDegree}
                                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Сохранить
                                    </button>
                                </div>
                                {successMessageDegree && (
                                    <div
                                        className="mt-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                                        {successMessageDegree}
                                    </div>
                                )}
                                {error && (
                                    <div
                                        className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                                        {error}
                                    </div>
                                )}
                            </div>
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
                                <p className="text-lg font-semibold mb-2 text-gray-700">Шанс развития деменции</p>
                                <p className="text-3xl font-bold text-blue-600">{testResult.kfr_points}%</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-lg font-semibold mb-2 text-gray-700">Очки симптомов</p>
                                <p className="text-3xl font-bold text-green-600">{testResult.symptoms_points}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <p className="text-lg font-semibold mb-2 text-gray-700">Когнитивный тест</p>
                                {testResult.gestures_result !== null ? (
                                    <p className="text-3xl font-bold text-purple-600">{testResult.gestures_result}/18</p>
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
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xl font-semibold text-gray-800">Статус: <span
                                className="text-blue-600">{testResult.status}</span></p>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-8">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-blue-600"/>
                            Рекомендации
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Для врача</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {testResult.recommendation_for_doctor.map((recommendation, index) => (
                                        <li key={index}>{recommendation}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Для пациента</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {testResult.recommendation_for_user.map((recommendation, index) => (
                                        <li key={index}>{recommendation}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Complaints and Anamnesis */}
                    <div className="mb-8">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 flex items-center">
                            <BookOpen className="w-6 h-6 mr-2 text-blue-600"/>
                            Жалобы и История болезни
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg sm:text-xl  font-semibold mb-3 text-gray-800">Жалобы</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {testResult.complaints.map((complaint, index) => (
                                        <li key={index}>{complaint}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Anamnesis Morbi</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {testResult.am.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Anamnesis Vitae</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {testResult.av.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Status Praesens</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {testResult.sp.map((symptom, index) => (
                                        <li key={index}>{symptom}</li>
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