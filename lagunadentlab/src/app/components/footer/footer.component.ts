import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { addIcons } from 'ionicons';
import { 
  logoFacebook, 
  logoInstagram, 
  logoTwitter, 
  logoLinkedin,
  callOutline,
  mailOutline,
  locationOutline,
  timeOutline,
  chevronUpOutline, logoWhatsapp } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, TranslatePipe]
})
export class FooterComponent {

  constructor(private router: Router) {
    addIcons({logoFacebook,logoWhatsapp,mailOutline,locationOutline,callOutline,timeOutline,logoInstagram,logoTwitter,logoLinkedin,chevronUpOutline});
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openSocialLink(url: string) {
    window.open(url, '_blank');
  }
}