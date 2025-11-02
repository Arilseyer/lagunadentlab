import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  heartOutline,
  checkmarkCircleOutline,
  bulbOutline,
  checkmarkCircle,
  ellipse,
  flagOutline,
  trendingUpOutline,
  trophy, arrowForwardOutline } from 'ionicons/icons';
import {
  IonContent,
  IonCard,
  IonIcon,
  IonImg
} from '@ionic/angular/standalone';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    IonContent,
    IonIcon,
    IonImg,
    NavbarComponent,
    FooterComponent
  ]
})
export class AboutPage implements OnInit {
  selectedTab: string = 'historia';

  values = [
    { icon: 'trophy-outline', title: 'Calidad', description: 'Compromiso con la excelencia en cada trabajo realizado' },
    { icon: 'checkmark-circle-outline', title: 'Responsabilidad', description: 'Cumplimiento y confiabilidad en cada entrega' },
    { icon: 'heart-outline', title: 'Honestidad', description: 'Transparencia y sinceridad en nuestras relaciones' },
    { icon: 'bulb-outline', title: 'Disciplina', description: 'Método y orden en todos nuestros procesos' }
  ];

  principles = [
    'Respeto mutuo entre equipo y clientes',
    'Comunicación clara y transparente',
    'Mejora continua en procesos y técnicas',
    'Ética profesional en cada decisión'
  ];

  timeline = [
    { 
      year: 'Origen', 
      title: 'Nuestra Historia', 
      description: 'Laguna Dent Lab surgió como necesidad de entregar prótesis de mejor calidad a los pacientes, ya que no había muchas opciones en el mercado que pudieran satisfacer. A raíz de esa problemática, decidimos emprender con el laboratorio. Durante el camino si nos hemos encontrado con varias complicaciones, pero las hemos ido resolviendo y en este punto, nos sentimos satisfechos con el trabajo que hemos logrado y cada día estamos avanzando más en ese camino.', 
      icon: 'flag-outline' 
    }
  ];

  constructor() {
    addIcons({arrowForwardOutline,checkmarkCircle,ellipse,trophyOutline,heartOutline,checkmarkCircleOutline,bulbOutline,flagOutline,trendingUpOutline,trophy});
  }

  ngOnInit() {
  }

  segmentChanged(event: CustomEvent) {
    // ion-segment emite detail.value con la opción seleccionada
    this.selectedTab = event?.detail?.value || this.selectedTab;
  }

  setSelectedTab(tab: string) {
    this.selectedTab = tab;
  }

}
