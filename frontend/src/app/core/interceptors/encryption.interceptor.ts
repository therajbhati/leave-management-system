import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';

// ─────────────────────────────────────────────────────────────────
// Encryption Interceptor
// Runs on EVERY HTTP request/response automatically.
//
// REQUEST:  { any payload } → { data: "ivHex:encryptedBase64" }
// RESPONSE: { data: "ivHex:encryptedBase64" } → { original payload }
//
// Works alongside jwtInterceptor — order in app.config.ts matters:
//   [jwtInterceptor, encryptionInterceptor]
//   JWT runs first (adds Authorization header), then encryption wraps body
// ─────────────────────────────────────────────────────────────────

export const encryptionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const encryptionService = inject(EncryptionService);

  // ── Encrypt Request Body ──────────────────────────────────────
  // Only encrypt if there is a body (POST, PATCH, PUT)
  // GET, DELETE requests have no body — skip
  let encryptedReq = req;

  if (req.body !== null && req.body !== undefined) {
    try {
      const encryptedBody = encryptionService.encrypt(req.body);
      encryptedReq = req.clone({
        body: { data: encryptedBody },
      });
    } catch (err) {
      console.error('❌ Request encryption failed:', err);
      // Send original if encryption fails (should never happen)
      encryptedReq = req;
    }
  }

  // ── Decrypt Response Body ─────────────────────────────────────
  return next(encryptedReq).pipe(
    map((event: HttpEvent<any>) => {
      // Only process HTTP responses (not upload progress events etc.)
      if ((event as any).body !== undefined && (event as any).body?.data) {
        try {
          const decryptedBody = encryptionService.decrypt((event as any).body.data);
          // Clone the event with decrypted body
          return Object.assign({}, event, { body: decryptedBody });
        } catch (err) {
          console.error('❌ Response decryption failed:', err);
          // Return as-is if decryption fails
          return event;
        }
      }
      return event;
    }),
  );
};
