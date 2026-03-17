import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatsService, TestResult } from '../../services/stats.service';

import { RadarChartComponent, RadarData } from '../../components/radar-chart/radar-chart.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RadarChartComponent],
  template: `
    <div class="results-container">
      <section class="final-score-panel">
        <h1>Résultat de l'examen</h1>
        
        <div class="score-circle" [class.success]="passed" [class.failure]="!passed">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path class="circle"
              [attr.stroke-dasharray]="(finalScore / totalQuestions * 100) + ', 100'"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" class="percentage">{{ finalScore }}/{{ totalQuestions }}</text>
          </svg>
        </div>

        <h2 [class.text-success]="passed" [class.text-failure]="!passed" style="margin-bottom: 0;">
          {{ passed ? "Félicitations ! Vous avez réussi l'examen." : "Dommage, vous n'avez pas atteint les 80% requis." }}
        </h2>

        @if (radarData && totalQuestions > 0) {
          <div class="radar-section">
            <h3 style="margin-bottom: 1.5rem; color: var(--text-primary);">Performance par thème</h3>
            <app-radar-chart [data]="radarData"></app-radar-chart>
          </div>
        }

        <div class="action-buttons">
          <button class="primary-btn" (click)="goHome()">Retour à l'accueil</button>
        </div>
      </section>

      <main class="review-questions" style="margin-top: 3rem;">
        <h2 style="text-align: center; margin-bottom: 2rem;">Détail de vos réponses</h2>
        @for (ans of answers; track ans.question; let i = $index) {
          <article class="review-card" [class.marked-correct]="ans.isCorrect" [class.marked-wrong]="!ans.isCorrect">
            <div class="q-header">
              <h3>Question {{ i + 1 }}</h3>
              <span class="category">{{ ans.category }}</span>
            </div>
            
            <p class="question-text">{{ ans.question }}</p>

            @if (ans.images?.length) {
              <div class="images">
                @for (img of ans.images; track img) {
                  <img [src]="img" alt="Illustration" width="200" />
                }
              </div>
            }

            <div class="answers-grid">
              <div class="user-answer">
                <strong>Votre réponse :</strong>
                <p>{{ ans.userAnswer }}</p>
              </div>
              <div class="correct-answer">
                <strong>Réponse attendue :</strong>
                <p>{{ ans.correctAnswer }}</p>
              </div>
            </div>

            @if (ans.explanation) {
              <div class="comment-box">
                <strong>ℹ️ Commentaire :</strong>
                <p>{{ ans.explanation }}</p>
              </div>
            }
          </article>
        }
      </main>
    </div>
  `,
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  private router = inject(Router);
  private stats = inject(StatsService);

  answers: any[] = [];
  totalQuestions = 40;
  finalScore = 0;
  passed = false;
  radarData: RadarData | null = null;

  ngOnInit() {
    const navState = history.state;
    if (navState && navState.answers) {
      this.answers = navState.answers;
      this.totalQuestions = navState.total || 40;
      this.finalScore = navState.score || 0;
      this.passed = this.finalScore >= 32;

      // Extract details for new stats service history including everything
      const fullHistoryAnswers = this.answers.map(a => ({
        question: a.question,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect,
        category: a.category || "Inconnu",
        images: a.images,
        explanation: a.explanation
      }));

      this.computeRadarData(fullHistoryAnswers);

      const isViewingHistory = navState.isViewingHistory === true;

      if (!isViewingHistory) {
        const result: TestResult = {
          date: new Date().toISOString(),
          timestamp: Date.now(),
          score: this.finalScore,
          total: this.totalQuestions,
          passed: this.passed,
          answers: fullHistoryAnswers
        };

        this.stats.saveResult(result);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  computeRadarData(answers: any[]) {
    const data: RadarData = {};

    for (const ans of answers) {
      const label = ans.category || "Autre";

      if (!data[label]) {
        data[label] = { correct: 0, total: 0 };
      }

      data[label].total++;
      if (ans.isCorrect) {
        data[label].correct++;
      }
    }

    this.radarData = data;
  }
}
