'use client';
import React, { useState, ChangeEvent, useEffect } from "react";

interface Answer {
    answerId: number;
    answerText: string | null;
}

interface QuestionProps {
    question: {
        id: string;
        text: string;
    };
    onAnswer: (questionId: string, answer: number | number[] | string) => void;
    type: string;
    answers: Answer[];
    currentAnswer?: number | number[] | string;
    onHeightChange: (value: number) => void;
    onWeightChange: (value: number) => void;
    height: number | null;
    weight: number | null;
}

export default function QuestionItem({
    question,
    onAnswer,
    type,
    answers,
    currentAnswer,
    onHeightChange,
    onWeightChange,
    height,
    weight,
}: QuestionProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | string>(
        currentAnswer || (type === 'MultipleChoice' ? [] : type === 'Height' || type === 'Weight' ? '' : 0)
    );

    useEffect(() => {
        setSelectedAnswer(currentAnswer || (type === 'MultipleChoice' ? [] : type === 'Height' || type === 'Weight' ? '' : 0));
    }, [question.id, type, currentAnswer]);

    const handleAnswer = (value: number | string) => {
        let newAnswer: number | number[] | string;
        console.log(type);
        if (type === 'MultipleChoice') {
            newAnswer = Array.isArray(selectedAnswer)
                ? selectedAnswer.includes(value as number)
                    ? selectedAnswer.filter(a => a !== value)
                    : [...selectedAnswer, value as number]
                : [value as number];
        } else if (type === 'Height') {
            newAnswer = Number(value);
            onHeightChange(newAnswer); // Call onHeightChange when height is updated
        } else if (type === 'Weight') {
            newAnswer = Number(value);
            onWeightChange(newAnswer); // Call onWeightChange when weight is updated
        } else if (type === 'CircleChoice') {
            newAnswer = value as number;
        } else {
            newAnswer = value as number;
        }

        setSelectedAnswer(newAnswer);
        onAnswer(question.id, newAnswer);
    };

    const handleNumberInput = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,3}$/.test(value)) {
            handleAnswer(value);
        }
    };

    const renderAnswerOptions = () => {
        switch (type) {
            case 'CircleChoice':
                return (
                    <div className="flex items-center justify-between space-x-2 sm:space-x-4">
                        {answers.map((answer, index) => (
                            <button
                                key={answer.answerId}
                                className={`rounded-full border-2 transition-all duration-200 ${
                                    selectedAnswer === answer.answerId
                                        ? "bg-black text-white"
                                        : "bg-white"
                                }`}
                                style={{
                                    width: `${2 + (index + 1) * 0.25}rem`,
                                    height: `${2 + (index + 1) * 0.25}rem`,
                                }}
                                onClick={() => handleAnswer(answer.answerId)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                );
            case 'SingleChoice':
            case 'MultipleChoice':
                return (
                    <div className="flex flex-wrap gap-2">
                        {answers.map((answer, index) => (
                            <button
                                key={answer.answerId}
                                className={`p-2 border rounded ${
                                    Array.isArray(selectedAnswer)
                                        ? selectedAnswer.includes(answer.answerId) ? "bg-black text-white" : "bg-white"
                                        : selectedAnswer === answer.answerId ? "bg-black text-white" : "bg-white"
                                }`}
                                onClick={() => handleAnswer(answer.answerId)}
                            >
                                {answer.answerText || `${index + 1}`}
                            </button>
                        ))}
                    </div>
                );
            case 'Height':
            case 'Weight':
                return (
                    <div className="flex items-center">
                        <input
                            type="number"
                            value={selectedAnswer as string}
                            onChange={handleNumberInput}
                            className="p-2 border rounded w-24 mr-2"
                            placeholder={type === 'Height' ? 'см' : 'кг'}
                            min="0"
                            max="999"
                        />
                        <span>{type === 'Height' ? 'см' : 'кг'}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{question.text}</h2>
            <div className="flex flex-col items-center">
                {renderAnswerOptions()}
                {type === 'CircleChoice' && (
                    <div className="w-full flex justify-between mt-2">
                        <span className="text-sm font-semibold max-w-60 text-left">{answers[0]?.answerText}</span>
                        <span className="text-sm font-semibold max-w-60 text-right">{answers[answers.length - 1]?.answerText}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
