import { Place } from './../../place.model';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offer-item',
  templateUrl: './offer-item.component.html',
  styleUrls: ['./offer-item.component.scss']
})
export class OfferItemComponent implements OnInit {
  @Input() offer: Place;

  constructor(private router: Router) {}

  ngOnInit() {
    if (!this.offer) {
      this.router.navigateByUrl('/places/tabs/offers');
    }
  }
}
