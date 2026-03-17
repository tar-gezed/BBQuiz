import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main class="app-container">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class App {
  title = 'naturalisation-test';
}
