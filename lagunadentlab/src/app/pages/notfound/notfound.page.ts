import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.page.html',
  styleUrls: ['./notfound.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, RouterLink, CommonModule, FormsModule]
})
export class NotfoundPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
