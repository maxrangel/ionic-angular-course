import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlacesService } from './../../places.service';
import { Place } from './../../place.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  NavController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss']
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  form: FormGroup;
  isLoading: boolean = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(
          place => {
            this.place = place;

            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              description: new FormControl(this.place.description, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(100)]
              })
            });
            this.isLoading = false;
          },
          async error => {
            this.isLoading = false;
            const alert = await this.alertCtrl.create({
              header: 'An error ocurred!',
              message: 'Could not fetch place, try again later...',
              buttons: [
                {
                  text: 'Ok',
                  handler: () =>
                    this.router.navigateByUrl('/places/tabs/offers')
                }
              ]
            });
            await alert.present();
          }
        );
    });
  }

  async onUpdateOffer() {
    if (!this.form.valid) return;
    const loading = await this.loadingCtrl.create({
      message: 'Updating offer...'
    });
    await loading.present();

    const { title, description } = this.form.value;

    this.placesService
      .updatePlace(this.place.id, title, description)
      .subscribe(async () => {
        await loading.dismiss();
        this.form.reset();
        this.router.navigateByUrl('/places/tabs/offers');
      });
  }

  ngOnDestroy() {
    if (this.placeSub) this.placeSub.unsubscribe();
  }
}
