import { take, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from './../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Booking } from './booking.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);
  private api = 'https://ionic-favorite-places.firebaseio.com';
  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchBookings() {
    this.http
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      placeTitle,
      placeImage,
      this.authService.userId,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    let generatedId: string;

    return this.http
      .post<{ name: string }>(`${this.api}/bookings.json`, {
        ...newBooking,
        id: null
      })
      .pipe(
        switchMap(response => {
          generatedId = response.name;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings =>
        this._bookings.next(
          bookings.filter(booking => booking.id !== bookingId)
        )
      )
    );
  }
}
