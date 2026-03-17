import { Injectable, signal } from '@angular/core';

export interface TestResult {
    date: string;
    timestamp: number;
    score: number;
    total: number;
    passed: boolean;
    answers: {
        question: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        category: string;
        images?: string[];
        explanation?: string | null;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {
    private STORAGE_KEY = 'naturalisation_test_stats';

    // Use signal for reactive state in components
    history = signal<TestResult[]>(this.loadHistory());

    constructor() { }

    private loadHistory(): TestResult[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse stats history', e);
                return [];
            }
        }
        return [];
    }

    saveResult(result: TestResult): void {
        const current = this.history();
        const updated = [result, ...current];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        this.history.set(updated);
    }

    clearHistory(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.history.set([]);
    }
}
