import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentTextOutline,
  sendOutline,
  locationOutline,
  timeOutline,
  callOutline,
  logoWhatsapp,
  logoFacebook,
  mailOutline, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-requestservices',
  templateUrl: './requestservices.page.html',
  styleUrls: ['./requestservices.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    FooterComponent,
    NavbarComponent
  ]
})
export class RequestservicesPage implements OnInit {
  form: FormGroup;
  serviceTypes: string[] = [
    'Prótesis Flexibles',
    'Placas Dentales',
    'Coronas',
    'Tecnología Digital'
  ];

  customPopoverOptions = {
    header: 'Tipo de servicio',
    subHeader: 'Selecciona el servicio que necesitas',
    cssClass: 'custom-popover select-dropdown',
    showBackdrop: true,
    backdropDismiss: true
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Registrar iconos
    addIcons({documentTextOutline,calendarOutline,timeOutline,arrowForwardOutline,sendOutline,locationOutline,callOutline,logoWhatsapp,logoFacebook,mailOutline});

    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      serviceType: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.form.valid) {
      // Aquí enviarías los datos del formulario a tu backend
      // console.log('Formulario enviado:', this.form.value);
      
      // Mostrar mensaje de éxito else {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
