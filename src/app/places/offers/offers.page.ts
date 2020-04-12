import { PlacesService } from './../places.service';
import { Place } from './../place.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss']
})
export class OffersPage implements OnInit, OnDestroy {
  loadedOffers: Place[];
  private placesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedOffers = places;
    });
  }

  async ionViewWillEnter() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading offers...'
    });
    await loading.present();
    this.placesService.fetchPlaces().subscribe(async () => {
      await loading.dismiss();
    });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigateByUrl(`/places/tabs/offers/edit/${offerId}`);
  }

  ngOnDestroy() {
    if (this.placesSub) this.placesSub.unsubscribe();
  }
}
