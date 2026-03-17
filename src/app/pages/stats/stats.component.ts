import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatsService, TestResult } from '../../services/stats.service';

@Component({
    selector: 'app-stats',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="stats-container">
      <header class="stats-header">
        <a href="javascript:void(0)" (click)="goBack()" class="back-link">← Retour</a>
        <h1>Vos Statistiques Globales</h1>
        <p class="subtitle">Retrouvez ici l'historique complet de tous vos examens passés.</p>
      </header>

      <main class="history-section">
        <div class="header-with-action">
          <h2>Historique des Sessions ({{ stats.history().length }})</h2>
          @if (stats.history().length > 0) {
            <button class="icon-btn" (click)="clearHistory()" title="Effacer tout l'historique">🗑️ Vider l'historique</button>
          }
        </div>

        @if (stats.history().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📊</span>
            <p>Vous n'avez pas encore de statistiques.</p>
            <button class="primary-btn" (click)="goHome()">Commencer un premier test</button>
          </div>
        } @else {
          <div class="history-grid">
            @for (attempt of stats.history(); track attempt.timestamp) {
              <div 
                class="history-card clickable-card" 
                [class.passed]="attempt.passed" 
                [class.failed]="!attempt.passed"
                (click)="viewDetails(attempt)"
                title="Cliquer pour voir le détail des réponses"
              >
                <div class="card-left">
                  <div class="history-header">
                    <span class="date">{{ attempt.timestamp | date:'dd/MM/yyyy à HH:mm' }}</span>
                    <span class="badge">{{ attempt.passed ? 'Réussi' : 'Échoué' }}</span>
                  </div>
                </div>
                
                <div class="card-right">
                  <div class="score">
                    <span class="fraction">{{ attempt.score }}/{{ attempt.total }}</span>
                    <span class="percentage">({{ (attempt.score / attempt.total) * 100 | number:'1.0-0' }}%)</span>
                  </div>
                  <span class="details-chevron">›</span>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
    styleUrl: './stats.component.css'
})
export class StatsComponent {
    stats = inject(StatsService);
    private router = inject(Router);

    clearHistory() {
        if (confirm('Êtes-vous sûr de vouloir effacer définitivement tout votre historique ?')) {
            this.stats.clearHistory();
        }
    }

    viewDetails(attempt: TestResult) {
        // If the attempt has full answers, open it. 
        // Fallback for old history payload: pass failedQuestions as answers so it doesn't break, 
        // though the display will only show failed questions for those older runs.
        const oldAttempt = attempt as any;
        const fullAnswers = attempt.answers || oldAttempt.failedQuestions?.map((f: any) => ({
            ...f,
            isCorrect: false
        })) || [];

        this.router.navigate(['/results'], {
            state: {
                answers: fullAnswers,
                score: attempt.score,
                total: attempt.total,
                isViewingHistory: true
            }
        });
    }

    goBack() {
        window.history.back();
    }

    goHome() {
        this.router.navigate(['/']);
    }
}
