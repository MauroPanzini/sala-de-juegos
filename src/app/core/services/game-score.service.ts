import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

export interface Score {
  name: string;
  score: number;
  date: string;
  game: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameScoreService {
  private leaderboardCollection = 'leaderboards';

  constructor(private firestore: AngularFirestore) {}

  addScore(score: Score): Promise<any> {
    return this.firestore
      .collection(this.leaderboardCollection)
      .doc(score.game)
      .collection('scores')
      .add(score);
  }

  getLeaderboard(game: string, limit: number = 10): Observable<Score[]> {
    return this.firestore
      .collection(this.leaderboardCollection)
      .doc(game)
      .collection<Score>('scores', (ref) =>
        ref.orderBy('score', 'desc').limit(limit)
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Score;
            return { ...data };
          })
        )
      );
  }

  /**
   * Obtiene la cantidad de registros en la subcolección "scores" para cada juego.
   * @param games Lista de identificadores de juegos.
   * @returns Promise con array de objetos { game, count }.
   */
  getGamesPlayCounts(games: string[]): Promise<{ game: string; count: number }[]> {
    const promises = games.map((game) =>
      this.firestore
        .collection(`${this.leaderboardCollection}/${game}/scores`)
        .get()
        .toPromise()
        .then((snapshot) => ({
          game,
          count: snapshot?.size ?? 0,
        }))
    );
    return Promise.all(promises);
  }
}
