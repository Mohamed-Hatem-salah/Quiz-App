// import { Injectable } from '@angular/core';
// import {
//   HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
// } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private getToken(): string | null {
//     let t = localStorage.getItem('token') || localStorage.getItem('jwt');
//     if (!t) return null;
//     return t.replace(/^"|"$/g, ''); 
//   }

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
//     if (req.url.includes('/auth/')) return next.handle(req);

//     const token = this.getToken();
//     if (!token) return next.handle(req);

//     const cloned = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` }
//     });

//     return next.handle(cloned);
//   }
// }