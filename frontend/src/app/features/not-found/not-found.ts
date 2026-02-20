import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-blue-600">404</h1>
        <h2 class="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h2>
        <p class="text-gray-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
        <a
          routerLink="/login"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
        >
          Go Back Home
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
