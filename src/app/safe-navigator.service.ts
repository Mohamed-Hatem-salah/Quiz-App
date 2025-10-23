// import { Injectable, inject } from '@angular/core';
// import { Router } from '@angular/router';

// @Injectable({ providedIn: 'root' })
// export class SafeNavigator {
//   private router = inject(Router);

//   async navigate(commands: any[], extras: any = {}) {

//     (document.activeElement as HTMLElement | null)?.blur?.();

  
//     document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
//     document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

  
//     await new Promise(requestAnimationFrame);

   
//     return this.router.navigate(commands, extras);
//   }
// }
