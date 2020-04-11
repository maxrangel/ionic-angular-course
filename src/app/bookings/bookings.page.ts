import { IonItemSliding, LoadingController } from '@ionic/angular';
import { BookingService } from './booking.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Booking } from './booking.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss']
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  private bookingSub: Subscription;

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  async onDeleteBooking(bookingId: string, slidingElement: IonItemSliding) {
    slidingElement.close();
    const loading = await this.loadingCtrl.create({
      message: 'Canceling booking...'
    });
    await loading.present();
    this.bookingService.cancelBooking(bookingId).subscribe(async () => {
      await loading.dismiss();
    });
    // Cancel booking with id offerId
  }

  ngOnDestroy() {
    if (!this.bookingSub) this.bookingSub.unsubscribe();
  }
}
