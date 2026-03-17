import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../services/stats.service';
import { QuestionsService, Difficulty } from '../../services/questions.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="home-container">
      <header class="hero">
        <h1>Bleu Blanc Quiz</h1>
        <p class="subtitle">Préparez-vous à l'entretien d'assimilation pour la naturalisation</p>
      </header>
      
      <section class="rules-card">
        <h2>Règles du Test</h2>
        <ul class="rules-list">
          <li>
            <span class="icon">⏱️</span>
            <div>
              <strong>Durée:</strong> 45 minutes maximum
            </div>
          </li>
          <li>
            <span class="icon">📝</span>
            <div>
              <strong>Questions:</strong> 40 questions uniques tirées aléatoirement
            </div>
          </li>
          <li>
            <span class="icon">🎯</span>
            <div>
              <strong>Objectif:</strong> 32 bonnes réponses minimum (80%) pour réussir
            </div>
          </li>
        </ul>
        <div class="difficulty-section">
          <h3 class="difficulty-title">Choisissez votre niveau</h3>
          <div class="segmented-control">
            <label class="segment" [class.active]="questions.difficulty() === 'easy'">
              <input type="radio" name="difficulty" value="easy" (change)="setDifficulty('easy')" [checked]="questions.difficulty() === 'easy'" />
              <span class="segment-label">🌱 Facile</span>
            </label>
            <label class="segment" [class.active]="questions.difficulty() === 'medium'">
              <input type="radio" name="difficulty" value="medium" (change)="setDifficulty('medium')" [checked]="questions.difficulty() === 'medium'" />
              <span class="segment-label">🎯 Moyen</span>
            </label>
            <label class="segment" [class.active]="questions.difficulty() === 'hard'">
              <input type="radio" name="difficulty" value="hard" (change)="setDifficulty('hard')" [checked]="questions.difficulty() === 'hard'" />
              <span class="segment-label">🔥 Difficile</span>
            </label>
          </div>
          <p class="difficulty-desc">{{ getDifficultyDescription() }}</p>
        </div>

        <div class="main-actions">
          <button class="primary-btn start-test" routerLink="/quiz">Commencer le Test</button>
          
          <div class="secondary-actions">
            <button class="secondary-btn revise-btn" routerLink="/revision">
              <span class="icon">📖</span> Révision
            </button>
            <button class="secondary-btn stats-btn" routerLink="/stats">
              <span class="icon">📊</span> Statistiques
            </button>
          </div>
        </div>
      </section>

      @if (stats.history().length > 0) {
        <section class="history-section">
          <div class="header-with-action">
            <h2>Vos Statistiques Récentes</h2>
            <button class="icon-btn" (click)="clearHistory()" title="Effacer l'historique">🗑️</button>
          </div>
          <div class="history-grid">
            @for (attempt of stats.history().slice(0, 5); track attempt.timestamp) {
              <div class="history-card" [class.passed]="attempt.passed" [class.failed]="!attempt.passed">
                <div class="history-header">
                  <span class="date">{{ attempt.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span class="badge">{{ attempt.passed ? 'Réussi' : 'Échoué' }}</span>
                </div>
                <div class="score">
                  <span class="fraction">{{ attempt.score }}/{{ attempt.total }}</span>
                  <span class="percentage">({{ (attempt.score / attempt.total) * 100 | number:'1.0-0' }}%)</span>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  stats = inject(StatsService);
  questions = inject(QuestionsService);

  setDifficulty(level: Difficulty) {
    this.questions.difficulty.set(level);
  }

  getDifficultyDescription(): string {
    switch (this.questions.difficulty()) {
      case 'easy': return 'Des pièges évidents. Plus de chances de réussir.';
      case 'medium': return 'Niveau standard de l\'examen. (Recommandé)';
      case 'hard': return 'Des pièges subtils. Pour ceux qui veulent un vrai défi.';
    }
  }

  clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout votre historique ?')) {
      this.stats.clearHistory();
    }
  }
}
