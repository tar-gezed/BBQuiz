import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Question, QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-revision',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="revision-container">
      <header class="revision-header">
        <div class="header-content">
          <a routerLink="/" class="back-link">← Retour</a>
          <h1>Mode Révision</h1>
        </div>
      </header>

      <div class="search-bar-wrapper">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Rechercher dans les questions ou les réponses..." 
            class="search-input"
          />
        </div>
      </div>

      <main class="review-questions" style="margin-top: 2rem;">
        @if (loading()) {
          <div class="loader">Chargement de la base de données...</div>
        } @else if (filteredQuestions().length === 0) {
          <div class="no-results">
            <p>Aucune question ne correspond à votre recherche "<strong>{{ searchQuery }}</strong>".</p>
          </div>
        } @else {
          <p class="results-count">{{ filteredQuestions().length }} résultat(s) trouvé(s)</p>
          @for (q of filteredQuestions(); track q['#']) {
            <article class="review-card marked-correct">
              <div class="q-header">
                <h3>Question {{ q['#'] }}</h3>
                <span class="category">{{ q.Categorie }}</span>
              </div>
              
              <p class="question-text">{{ q.Questions }}</p>

              @if (q.Images?.length) {
                <div class="images">
                  @for (img of q.Images; track img) {
                    <img [src]="img" alt="Illustration" width="200" />
                  }
                </div>
              }

              <div class="answers-grid single-answer">
                <div class="correct-answer">
                  <strong>Réponse attendue :</strong>
                  <p>{{ q.Reponse }}</p>
                </div>
              </div>

              @if (q.Commentaire) {
                <div class="comment-box">
                  <strong>ℹ️ Commentaire :</strong>
                  <p>{{ q.Commentaire }}</p>
                </div>
              }
            </article>
          }
        }
      </main>
    </div>
  `,
  styleUrl: './revision.component.css'
})
export class RevisionComponent implements OnInit {
  private questionsService = inject(QuestionsService);

  loading = signal(true);
  allQuestions = signal<Question[]>([]);

  // Use a writable signal for the ngModel to avoid two-way binding issues with standard signals natively in simple inputs
  // Note: in Angular 16+, you can use model(), but here we use a traditional property with a side-effect or just a signal 
  private _searchQuery = signal('');

  get searchQuery() {
    return this._searchQuery();
  }

  set searchQuery(value: string) {
    this._searchQuery.set(value);
  }

  filteredQuestions = computed(() => {
    const query = this._searchQuery().trim();
    if (!query) {
      return this.allQuestions();
    }

    const normalizeStr = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const normalizedQuery = normalizeStr(query);

    return this.allQuestions().filter(q =>
      normalizeStr(q.Questions).includes(normalizedQuery) ||
      normalizeStr(q.Reponse).includes(normalizedQuery)
    );
  });

  async ngOnInit() {
    try {
      const questions = await this.questionsService.getQuestions();
      this.allQuestions.set(questions);
    } catch (e) {
      console.error("Erreur de chargement", e);
    } finally {
      this.loading.set(false);
    }
  }
}
