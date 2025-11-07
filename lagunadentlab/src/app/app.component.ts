import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonChip, IonLabel } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { OnlineService } from './services/online.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, IonApp, IonRouterOutlet, IonChip, IonLabel],
})
export class AppComponent {
  isOnline$!: Observable<boolean>;

  constructor(private onlineService: OnlineService) {
    this.isOnline$ = this.onlineService.isOnline$;
  }
}