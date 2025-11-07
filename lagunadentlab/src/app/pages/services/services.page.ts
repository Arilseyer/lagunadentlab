import { Component, OnInit } from '@angular/core';
import { IonContent, IonIcon} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import {layersOutline, checkmarkCircleOutline, ribbonOutline, desktopOutline,
  scanOutline, brushOutline, cubeOutline,checkmarkDoneOutline, arrowForwardOutline, hardwareChipOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, NavbarComponent, FooterComponent, RouterLink, TranslatePipe]
})
export class ServicesPage implements OnInit {

  constructor() {
    addIcons({layersOutline,checkmarkCircleOutline,arrowForwardOutline,ribbonOutline,desktopOutline,scanOutline,brushOutline,cubeOutline,checkmarkDoneOutline,hardwareChipOutline});
   }

  ngOnInit() {
  }

}



