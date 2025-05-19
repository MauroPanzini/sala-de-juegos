import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  showCards = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkRoute();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.checkRoute());
  }

  checkRoute(): void {
    const url = this.router.url;
    this.showCards = url === '/juegos';
  }

  navigateToGame(path: string): void {
    this.router.navigate(['/juegos', path]);
  }
}
