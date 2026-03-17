import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ResultsComponent } from './pages/results/results.component';
import { RevisionComponent } from './pages/revision/revision.component';
import { StatsComponent } from './pages/stats/stats.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'quiz', component: QuizComponent },
    { path: 'results', component: ResultsComponent },
    { path: 'revision', component: RevisionComponent },
    { path: 'stats', component: StatsComponent },
    { path: '**', redirectTo: '' }
];
