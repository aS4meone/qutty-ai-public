'use client';

import Link from "next/link";
import React, {useState, useEffect, useCallback} from "react";
import Header from "@/components/Header";

export default function EnhancedLandingPage() {
    const [activeTab, setActiveTab] = useState('about');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isModalOpen, closeModal]);

    return (
        <div className="min-h-screen from-white text-[#12375F]">
            <Header/>

            <main className="container mx-auto px-4 py-12">
                <section className="mb-16 text-center">
                    <h2 className="text-5xl font-bold mb-4 animate-fade-in-down">Новая эра когнитивной диагностики</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        <strong>Qutty AI</strong> — это передовая система, использующая <strong>ИИ</strong> для быстрого выявления
                        рисков развития деменции с помощью небольшого опросника. Наша диагностика <strong>независима от языка</strong>,
                        что делает нас <strong>уникальными и доступными</strong> для медицинских центров по всему миру.
                    </p>
                    <button
                        onClick={openModal}
                        className="bg-[#12375F] text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-blue-700 transition-colors hover:scale-105">
                        Сделайте шаг в мир современной медицины
                    </button>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-8 text-center">Почему Qutty AI?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">Точность</h3>
                            <p>Наши алгоритмы, разработанные в сотрудничестве с медицинскими специалистами, обеспечивают
                                высокий уровень точности при выявлении когнитивных нарушений.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">Глобальная применимость</h3>
                            <p>Тест на основе анализа движений рук преодолевает языковые барьеры, делая его
                                универсальным инструментом диагностики в любой стране мира.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">Автоматизация</h3>
                            <p>Наша платформа автоматически собирает жалобы пациентов, формирует анамнез и генерирует рекомендации как для врачей, так и для пациентов, что существенно ускоряет процесс диагностики и повышает эффективность работы медицинского персонала.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-16 bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-semibold mb-6 text-center">Откройте для себя Qutty AI</h2>
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-2 font-semibold ${activeTab === 'about' ? 'border-b-2 border-blue-500' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            О нас
                        </button>
                        <button
                            className={`px-4 py-2 font-semibold ${activeTab === 'technology' ? 'border-b-2 border-blue-500' : ''}`}
                            onClick={() => setActiveTab('technology')}
                        >
                            Технологии
                        </button>
                        <button
                            className={`px-4 py-2 font-semibold ${activeTab === 'impact' ? 'border-b-2 border-blue-500' : ''}`}
                            onClick={() => setActiveTab('impact')}
                        >
                            Эффект
                        </button>
                    </div>
                    <div className="mt-4">
                        {activeTab === 'about' && (
                            <p className="text-lg">
                                Qutty AI — это первая платформа, сочетающая ИИ и медицинские знания для максимально
                                точной и быстрой когнитивной диагностики. Наш медицинский эксперт, Жибек Жолдасова, один из ведущих специалистов в Центральной Азии по деменции и болезни Альцгеймера, помогает нам создавать уникальные решения для оценки когнитивных рисков.
                            </p>
                        )}
                        {activeTab === 'technology' && (
                            <p className="text-lg">
                                В основе Qutty AI — технология анализа движений рук, что позволяет проводить
                                диагностику, не зависящую от языка. Это решение подходит для медицинских учреждений в
                                любой точке мира.
                            </p>
                        )}
                        {activeTab === 'impact' && (
                            <p className="text-lg">
                                Наши технологии автоматизации помогают врачам быстрее и эффективнее работать с пациентами, собирая жалобы, заполняя анамнезы и предоставляя рекомендации. Это повышает качество медицинского обслуживания и снижает риски для пациентов.
                            </p>
                        )}
                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-8 text-center">Преимущества Qutty AI</h2>
                    <div className="relative">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transform skew-y-3"></div>
                        <div className="relative bg-white p-8 rounded-lg shadow-xl z-10">
                            <h3 className="text-2xl font-semibold mb-4">Один тест — глобальные возможности</h3>
                            <p className="text-lg mb-4">
                                Наш тест, основанный на движениях рук, универсален для использования по всему миру,
                                исключая необходимость адаптации к языковым и культурным особенностям.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-lg">
                                <li>Применимость в любой точке мира</li>
                                <li>Отсутствие языковых барьеров</li>
                                <li>Оптимизация международных медицинских процессов</li>
                                <li>Ускоренная диагностика и помощь пациентам</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="text-center">
                    <h2 className="text-3xl font-semibold mb-6">Готовы изменить будущее медицины?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Присоединяйтесь к Qutty AI и начните использовать передовые решения для раннего выявления
                        когнитивных изменений. Мы поможем вам повысить эффективность медицинской помощи и улучшить
                        результаты лечения.
                    </p>
                    <button
                        onClick={openModal}
                        className="bg-[#12375F] text-white px-10 py-4 rounded-full text-xl font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 duration-200 shadow-lg">
                        Начать с Qutty AI
                    </button>
                </section>
            </main>

            <footer className="bg-[#12375F] text-white mt-16 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Qutty AI</h3>
                            <p>Инновационная система диагностики с применением ИИ и передовых медицинских
                                технологий.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Контакты</h3>
                            <p>Email: zholdas.alnur@gmail.com</p>
                            <p>Телефон: +7 (747) 205 1507</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Социальные сети</h3>
                            <ul className="space-y-2">
                                <li><Link href="https://facebook.com/zhibek.zholdassova">Facebook</Link></li>
                                <li><Link href="https://instagram.com/qutty_net">Instagram</Link></li>
                                <li><Link href="https://linkedin.com/company/103664586">LinkedIn</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

           {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleOverlayClick}
                >
                    <div className="bg-white p-8 rounded-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Свяжитесь с нами для сотрудничества</h2>
                        <p className="mb-4">
                            Qutty AI предлагает инновационные решения для диагностики и открывает новые возможности в медицине.
                      <br/>  Свяжитесь с нами, и наши специалисты помогут вам внедрить передовые технологии в вашу работу.</p>
                        <p className="mb-2"><strong>Email:</strong> <a href="mailto:zholdas.alnur@gmail.com"
                                                                       className="text-blue-600 hover:underline">zholdas.alnur@gmail.com</a>
                        </p>
                        <p className="mb-4"><strong>Телефон/WhatsApp:</strong> <a href="tel:+77472051507"
                                                                                  className="text-blue-600 hover:underline">+7
                            (747) 205-1507</a></p>

                        <button
                            onClick={closeModal}
                            className="bg-[#12375F] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
