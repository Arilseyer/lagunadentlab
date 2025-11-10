import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { SwWarmupService } from './app/services/sw-warmup.service';
import { OnlineService } from './app/services/online.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
    {
      provide: APP_INITIALIZER,
      useFactory: (svc: SwWarmupService) => () => void 0,
      deps: [SwWarmupService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (svc: OnlineService) => () => void 0,
      deps: [OnlineService],
      multi: true,
    },
  ],
});
