import { AuthService } from './../auth/auth.service';
import { Place } from './place.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface PlaceHttpData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  private api = 'https://ionic-favorite-places.firebaseio.com';

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceHttpData }>(`${this.api}/offered-places.json`)
      .pipe(
        map(response => {
          const places = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  response[key].title,
                  response[key].description,
                  response[key].imageUrl,
                  response[key].price,
                  new Date(response[key].availableFrom),
                  new Date(response[key].availableTo),
                  response[key].userId
                )
              );
            }
          }
          return places;
        }),
        tap(places => this._places.next(places))
      );
  }

  getPlace(id: string) {
    return this.http
      .get<PlaceHttpData>(`${this.api}/offered-places/${id}.json`)
      .pipe(
        map(placeData => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
          );
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
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

    return this.http
      .post<{ name: string }>(`${this.api}/offered-places.json`, {
        ...newPlace,
        id: null
      })
      .pipe(
        switchMap(response => {
          generatedId = response.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];

    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || !places.length) return this.fetchPlaces();
        else return of(places);
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(
          place => place.id === placeId
        );
        updatedPlaces = [...places];
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

        return this.http.put(`${this.api}/offered-places/${placeId}.json`, {
          ...updatedPlaces[updatedPlaceIndex],
          id: null
        });
      }),
      tap(places => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
