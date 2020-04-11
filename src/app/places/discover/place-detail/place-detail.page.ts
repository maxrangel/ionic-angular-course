import { AuthService } from './../../../auth/auth.service';
import { BookingService } from './../../../bookings/booking.service';
import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { Place } from './../../place.model';
import { PlacesService } from './../../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController
} from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable: boolean = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== this.authService.userId;
      });
    });
  }

  async onBookPlace() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Choose an action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        { text: 'Cancel', role: 'destructive' }
      ]
    });

    await actionSheet.present();
  }

  async openBookingModal(mode: 'select' | 'random') {
    const modal = await this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === 'confirm') {
      const loading = await this.loadingCtrl.create({
        message: 'Booking place...'
      });
      await loading.present();

      const { bookingData } = data;
      this.bookingService
        .addBooking(
          this.place.id,
          this.place.title,
          this.place.imageUrl,
          bookingData.firstName,
          bookingData.lastName,
          bookingData.guestNumber,
          bookingData.startDate,
          bookingData.endDate
        )
        .subscribe(async () => {
          await loading.dismiss();
        });
    }
  }

  ngOnDestroy() {
    if (this.placeSub) this.placeSub.unsubscribe();
  }
}
