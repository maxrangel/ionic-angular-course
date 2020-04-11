import { PlacesService } from './../../places.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
    });
  }

  async onCreateOffer() {
    if (!this.form.valid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Creating offer...',
    });

    await loading.present();

    const { title, description, price, dateFrom, dateTo } = this.form.value;

    this.placesService
      .addPlace(title, description, +price, dateFrom, dateTo)
      .subscribe(async () => {
        await loading.dismiss();
        this.form.reset();
        this.router.navigateByUrl('/places/tabs/offers');
      });
  }
}
