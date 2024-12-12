'use client'

import {useState, useEffect, useRef} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Home, FilePlus, LogOut, Search, Menu, Calendar, Clock} from 'lucide-react'

interface TestResult {
    id: string
    patient_name: string
    created_at: string
    status: string
}

interface CreateResponse {
    test_id: string
}

export default function DoctorCabinet() {
    const [testResults, setTestResults] = useState<TestResult[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [patientName, setPatientName] = useState('')
    const [patientBirthDate, setPatientBirthDate] = useState('')
    const [patientPhoneNumber, setPatientPhoneNumber] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const router = useRouter()
    const modalRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const handleUnauthorized = () => {
        localStorage.removeItem('access_token')
        router.push('/')
    }

    const fetchTestResults = async () => {
        const token = localStorage.getItem('access_token')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/doctor/test-results`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 403) {
                handleUnauthorized()
                return
            }
            if (!response.ok) {
                throw new Error('Failed to fetch test results')
            }
            const data = await response.json()
            setTestResults(data)
        } catch (error) {
            console.error('Error fetching test results:', error)
        }
    }

    useEffect(() => {
        fetchTestResults()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const filteredResults = testResults.filter(result =>
        result.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        router.push('/')
    }

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('access_token')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/doctor/create_test_attempt/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_name: patientName,
                    patient_birth_date: new Date(patientBirthDate).toISOString(),
                    patient_phone_number: patientPhoneNumber
                })
            })
            if (response.status === 403) {
                handleUnauthorized()
                return
            }
            if (!response.ok) {
                throw new Error('Failed to create test attempt')
            }
            if (response.ok) {
                const data: CreateResponse = await response.json()
                const testId = data.test_id

                router.push(`/doctor/${testId}`)
            }
            setIsModalOpen(false)
            setPatientName('')
            setPatientBirthDate('')
            setPatientPhoneNumber('')
            await fetchTestResults()
        } catch (error) {
            console.error('Error creating test attempt:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#D1E3F8] text-[#12375F]">
            <div className="flex h-screen">
                {!isSidebarOpen && (
                    <button
                        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu size={24}/>
                    </button>
                )
                }
                {/* Sidebar */}
                <div
                    ref={sidebarRef}
                    className={`${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg rounded-r-3xl overflow-hidden transition-transform duration-300 ease-in-out`}
                >
                    <div className="flex flex-col h-full">
                        <Link href="/" className="flex items-center gap-2 p-6 bg-[#12375F] text-white">
                            <span className="font-semibold text-2xl">Qutty AI</span>
                        </Link>
                        <Link href="/doctor"
                              className="flex items-center gap-2 p-4 hover:bg-[#E6F0FF] transition-colors">
                            <Home size={20}/>
                            <span>Главная</span>
                        </Link>
                        <button
                            className="flex items-center gap-2 p-4 hover:bg-[#E6F0FF] transition-colors"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FilePlus size={20}/>
                            <span>Создать тест</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 p-4 mt-auto text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20}/>
                            <span>Выйти</span>
                        </button>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-auto p-4 lg:p-8 w-full">
                    <div className="bg-white shadow-lg rounded-3xl p-4 lg:p-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#12375F] to-[#2A5F8F]">
                            Кабинет врача
                        </h1>
                        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                            <div className="relative w-full lg:w-64">
                                <input
                                    type="text"
                                    placeholder="Поиск пациента"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border-2 border-[#12375F] rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A5F8F] focus:border-transparent transition-all duration-300 ease-in-out"
                                />
                                <Search className="absolute left-3 top-2.5 text-[#12375F]" size={20}/>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full lg:w-auto bg-gradient-to-r from-[#12375F] to-[#2A5F8F] hover:from-[#2A5F8F] hover:to-[#12375F] text-white font-bold py-2 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                            >
                                Создать тест
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                <thead className="bg-[#E6F0FF] text-[#12375F]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Имя пациента
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Дата создания
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E6F0FF]">
                                {testResults.filter(result =>
                                    result.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((result) => (
                                    <tr key={result.id} className="hover:bg-[#F8FBFF] transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap">{result.patient_name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap flex items-center">
                                            <Calendar size={16} className="mr-2 text-[#12375F]"/>
                                            {new Date(result.created_at).toLocaleDateString()}
                                            <Clock size={16} className="ml-4 mr-2 text-[#12375F]"/>
                                            {new Date(result.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                                result.status === 'CREATED' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Link href={`/doctor/${result.id}`}
                                                  className="text-[#12375F] hover:text-[#2A5F8F] flex items-center transition-colors">
                                                Подробнее
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={modalRef} className="bg-white p-8 rounded-3xl shadow-xl w-96">
                        <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#12375F] to-[#2A5F8F]">
                            Создать тест
                        </h2>
                        <form onSubmit={handleCreateTest}>
                            <div className="mb-4">
                                <label htmlFor="patientName" className="block font-medium text-[#12375F] mb-1">
                                    Имя пациента
                                </label>
                                <input
                                    type="text"
                                    id="patientName"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-[#12375F] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5F8F] focus:border-transparent transition-all duration-300 ease-in-out"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="patientBirthDate"
                                       className="block font-medium text-[#12375F] mb-1">
                                    Дата рождения
                                </label>
                                <input
                                    type="date"
                                    id="patientBirthDate"
                                    value={patientBirthDate}
                                    onChange={(e) => setPatientBirthDate(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-[#12375F] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5F8F] focus:border-transparent transition-all duration-300 ease-in-out"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="patientPhoneNumber"
                                       className="block font-medium text-[#12375F] mb-1">
                                    Номер телефона
                                </label>
                                <input
                                    type="tel"
                                    id="patientPhoneNumber"
                                    value={patientPhoneNumber}
                                    onChange={(e) => setPatientPhoneNumber(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-[#12375F] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5F8F] focus:border-transparent transition-all duration-300 ease-in-out"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border-2 border-[#12375F] rounded-md font-medium text-[#12375F] hover:bg-[#E6F0FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12375F] transition-all duration-300 ease-in-out"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md font-medium text-white bg-gradient-to-r from-[#12375F] to-[#2A5F8F] hover:from-[#2A5F8F] hover:to-[#12375F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12375F] transition-all duration-300 ease-in-out"
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}