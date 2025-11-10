import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonChip, IonLabel } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { OnlineService } from './services/online.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslatePipe } from './pipes/translate.pipe';
import { ApprovalNotificationService } from './services/approval-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, IonApp, IonRouterOutlet, IonChip, IonLabel],
})
export class AppComponent {
  isOnline$!: Observable<boolean>;

  constructor(private onlineService: OnlineService, private router: Router, private approvalNotifications: ApprovalNotificationService) {
    this.isOnline$ = this.onlineService.isOnline$;

    // Track router navigation to show/hide global loader
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart) {
        this.pendingLoads++;
        this.loading$.next(true);
      } else if (evt instanceof NavigationEnd || evt instanceof NavigationCancel || evt instanceof NavigationError) {
        this.pendingLoads = Math.max(0, this.pendingLoads - 1);
        if (this.pendingLoads === 0) {
          this.loading$.next(false);
        }
      }
    });

    // In case no navigation events fire, hide loader after a grace period
    setTimeout(() => {
      this.pendingLoads = 0;
      this.loading$.next(false);
    }, 1500);

    // Iniciar listener de notificaciones de aprobación de citas
    this.approvalNotifications.start();
  }
}