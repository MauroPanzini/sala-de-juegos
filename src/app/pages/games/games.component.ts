import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent {
  showCards = true;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      this.showCards = currentUrl === '/juegos'; // o con includes('/juegos') si necesitás más control
    });
  }

  navigateToGame(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
}
