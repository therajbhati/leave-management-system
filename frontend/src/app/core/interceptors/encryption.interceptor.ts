import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';

export const encryptionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const encryptionService = inject(EncryptionService);

  // ── Encrypt Request ──────────────────────────────────────
  let encryptedReq = req;

  if (req.body !== null && req.body !== undefined) {
    try {
      const encryptedBody = encryptionService.encrypt(req.body);
      encryptedReq = req.clone({
        body: { data: encryptedBody },
      });
    } catch (err) {
      console.error('Request encryption failed:', err);
      encryptedReq = req;
    }
  }

  // ── Decrypt Response ─────────────────────────────────────
  return next(encryptedReq).pipe(
    map((event: HttpEvent<any>) => {
      // only process actual HTTP responses
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      if (event.body && typeof event.body.data === 'string' && event.body.data.includes(':')) {
        try {
          const decryptedBody = encryptionService.decrypt(event.body.data);
          return event.clone({ body: decryptedBody });
        } catch (err: any) {
          console.error(' Response decryption failed:', err.message);
          throw new Error(`Decryption failed: ${err.message}`);
        }
      }

      return event;
    }),

    catchError((err) => {
      console.error(' Interceptor error:', err);
      return throwError(() => err);
    }),
  );
};
