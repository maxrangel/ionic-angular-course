import { AuthService } from './../auth/auth.service';
import { Place } from './place.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      '1',
      'Manhattan Mansion',
      'In the heart of NY City',
      'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg',
      149.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      '1'
    ),
    new Place(
      '2',
      "L'Amour Toujours",
      'A romatic place in Paris',
      'https://www.turismoviajar.com/wp-content/uploads/2019/10/paris-2020.jpg',
      189.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      '2'
    ),
    new Place(
      '3',
      'The Foggy Place',
      'Not your average city to trip!',
      'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
      209.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      '3'
    ),
  ]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) {}

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map(places => ({ ...places.find(place => place.id === id) }))
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );

    return this.places.pipe(
      take(1),
      delay(2000),
      tap(places => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(2000),
      tap(places => {
        const updatedPlaceIndex = places.findIndex(
          place => place.id === placeId
        );
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];

        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );

        this._places.next(updatedPlaces);
      })
    );
  }
}
