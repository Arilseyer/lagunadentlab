import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false, // Hace que el pipe se actualice cuando cambia el idioma
  standalone: true
})
export class TranslatePipe implements PipeTransform {

  constructor(private translationService: TranslationService) {}

  transform(key: string, params?: { [key: string]: any }): string {
    return this.translationService.translate(key, params);
  }
}
