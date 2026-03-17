import { Injectable, signal } from '@angular/core';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  "#": string;
  Categorie: string;
  Questions: string;
  Reponse: string;
  Commentaire: string;
  Images?: string[];
  FaussesRéponses?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private questionsUrl = 'assets/data/data.json';

  difficulty = signal<Difficulty>('medium');

  async getQuestions(): Promise<Question[]> {
    const response = await fetch(this.questionsUrl);
    return await response.json();
  }

  getRandomQuestions(questions: Question[], count: number = 40): Question[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
