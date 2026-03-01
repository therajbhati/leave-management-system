import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { encryptionInterceptor } from './core/interceptors/encryption.interceptor';

// ─────────────────────────────────────────────────────────────────
// Interceptor Order (IMPORTANT):
//   1. jwtInterceptor    → attaches Authorization: Bearer token to headers
//   2. encryptionInterceptor → encrypts request body, decrypts response body
//
// Angular processes interceptors in the order they are listed.
// JWT must run first so the token is in the header before the body is encrypted.
// ─────────────────────────────────────────────────────────────────

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, encryptionInterceptor])),
  ],
};
