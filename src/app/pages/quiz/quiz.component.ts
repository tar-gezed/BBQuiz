import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Question, QuestionsService } from '../../services/questions.service';
import { StatsService, TestResult } from '../../services/stats.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-container">
      @if (loading()) {
        <div class="loader">Chargement des questions...</div>
      } @else {
        <header class="quiz-header">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="((currentIndex() + 1) / totalQuestions()) * 100"></div>
          </div>
          <div class="meta-info">
            <span class="question-count">Question {{ currentIndex() + 1 }}/{{ totalQuestions() }}</span>
            <span class="timer" [class.warning]="timeLeft() < 300">
              ⏱️ {{ formatTime(timeLeft()) }}
            </span>
          </div>
        </header>

        <main class="question-card" [class.anim-in]="animating()">
          <div class="category-badge">{{ currentQuestion()?.Categorie }}</div>
          
          <h2 class="question-text">{{ currentQuestion()?.Questions }}</h2>
          
          <div class="choices-grid">
            @for (choice of currentChoices(); track choice) {
              <label class="choice-card" [class.selected]="userAnswer === choice">
                <input 
                  type="radio" 
                  name="quizAnswer" 
                  [value]="choice" 
                  [(ngModel)]="userAnswer" 
                  class="hidden-radio" />
                <span class="choice-text">{{ choice }}</span>
              </label>
            }
          </div>

          <div class="actions">
            <button class="primary-btn" (click)="submitAnswer()" [disabled]="!userAnswer">
              {{ isLastQuestion() ? "Terminer l'examen" : "Valider & Suivant" }}
            </button>
          </div>
        </main>
      }
    </div>
  `,
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit, OnDestroy {
  private questionsService = inject(QuestionsService);
  private statsService = inject(StatsService);
  private router = inject(Router);

  loading = signal(true);
  questions = signal<Question[]>([]);
  currentIndex = signal(0);
  totalQuestions = signal(40);

  // Timer setup (45 mins in seconds = 2700)
  timeLeft = signal(2700);
  private timerInterval: any;

  userAnswer = '';
  animating = signal(false);

  currentChoices = signal<string[]>([]);

  // Store all attempts
  answersHist: any[] = [];
  score = 0;

  async ngOnInit() {
    try {
      const allQuestions = await this.questionsService.getQuestions();
      const selected = this.questionsService.getRandomQuestions(allQuestions, 40);
      this.questions.set(selected);
      this.totalQuestions.set(selected.length);
      this.prepareChoices(selected[0]);
      this.loading.set(false);
      this.startTimer();
    } catch (e) {
      console.error("Erreur au chargement des questions", e);
      alert("Impossible de charger les questions. Retour à l'accueil.");
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  currentQuestion(): Question | undefined {
    return this.questions()[this.currentIndex()];
  }

  isLastQuestion(): boolean {
    return this.currentIndex() === this.totalQuestions() - 1;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft() > 0) {
        this.timeLeft.update(t => t - 1);
      } else {
        clearInterval(this.timerInterval);
        this.finishTest();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  prepareChoices(q: Question) {
    if (!q) return;

    // On met la bonne réponse
    const choices = [q.Reponse];

    // On rajoute 3 fausses réponses (si dispos)
    if (q.FaussesRéponses) {
      const mode = this.questionsService.difficulty();
      let min = 4;
      let max = 8;

      if (mode === 'easy') {
        min = 0;
        max = 5;
      } else if (mode === 'hard') {
        min = 6;
        max = 99; // Bornes larges pour capter les index supérieurs
      }

      // Filtrage dynamique basé sur les clés des FaussesRéponses
      let filteredAnswers = Object.entries(q.FaussesRéponses)
        .filter(([key, _]) => {
          const numKey = parseInt(key, 10);
          return !isNaN(numKey) && numKey >= min && numKey <= max;
        })
        .map(([_, value]) => value);

      // Sécurité : si jamais le filtrage retourne moins de 3 réponses fausses
      if (filteredAnswers.length < 3) {
        filteredAnswers = Object.values(q.FaussesRéponses);
      }

      // Shuffle the false answers
      const shuffledFalse = [...filteredAnswers].sort(() => 0.5 - Math.random());
      choices.push(...shuffledFalse.slice(0, 3));
    } else {
      // Fallback in case the new JSON isn't fully ready
      choices.push("Réponse erronée A", "Réponse erronée B", "Réponse erronée C");
    }

    // On shuffle les 4 choix pour que la bonne réponse ne soit pas toujours la 1ère
    const finalChoices = choices.sort(() => 0.5 - Math.random());
    this.currentChoices.set(finalChoices);
  }

  submitAnswer() {
    const q = this.currentQuestion();
    if (!q) return;

    const isCorrect = this.userAnswer === q.Reponse;
    if (isCorrect) this.score++;

    this.answersHist.push({
      question: q.Questions,
      userAnswer: this.userAnswer,
      correctAnswer: q.Reponse,
      isCorrect: isCorrect,
      explanation: q.Commentaire,
      images: q.Images || [],
      category: q.Categorie
    });

    if (this.isLastQuestion()) {
      this.finishTest();
    } else {
      this.animating.set(true);
      setTimeout(() => {
        this.currentIndex.update(i => i + 1);
        this.prepareChoices(this.currentQuestion()!);
        this.userAnswer = '';
        this.animating.set(false);
      }, 300);
    }
  }

  finishTest() {
    this.router.navigate(['/results'], {
      state: {
        answers: this.answersHist,
        score: this.score,
        total: this.totalQuestions()
      }
    });
  }
}
