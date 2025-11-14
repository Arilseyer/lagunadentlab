/**
 * Componente de loading con animación Lottie de diente limpio
 * Muestra una animación mientras se cargan los datos
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-lottie-loader',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  template: `
    <div class="lottie-loader-container" [class.fullscreen]="fullscreen">
      <div class="lottie-wrapper">
        <ng-lottie 
          [options]="options"
          (animationCreated)="animationCreated($event)"
        ></ng-lottie>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .lottie-loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .lottie-loader-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 9999;
    }

    .lottie-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    ng-lottie {
      width: 200px;
      height: 200px;
    }

    .loading-message {
      font-size: 1rem;
      color: var(--ion-color-medium);
      text-align: center;
      margin: 0;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      ng-lottie {
        width: 150px;
        height: 150px;
      }

      .loading-message {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LottieLoaderComponent {
  @Input() message: string = 'Cargando...';
  @Input() fullscreen: boolean = false;
  @Input() animationPath: string = 'assets/animations/clean-tooth.json';

  options: AnimationOptions = {
    path: this.animationPath,
    loop: true,
    autoplay: true
  };

  ngOnInit() {
    // Actualizar path si cambia el input
    this.options = {
      path: this.animationPath,
      loop: true,
      autoplay: true
    };
  }

  animationCreated(animationItem: any): void {
    console.log('Animación Lottie creada:', animationItem);
  }
}
