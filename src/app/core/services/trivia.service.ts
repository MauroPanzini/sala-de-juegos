import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Question } from '../models/trivia.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TriviaService {
  private readonly API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=151';

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<Question[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(response => response.results), // [{ name, url }]
      switchMap((pokemonList: any[]) => {
        const randomIndexes = this.getRandomIndexes(pokemonList.length, 151); 
        const selectedPokemons = randomIndexes.map(i => pokemonList[i]);

        // Para cada uno, obtenemos su data detallada (con imagen)
        const requests = selectedPokemons.map(p => this.http.get(p.url));

        return forkJoin(requests).pipe(
          map((details: any[]) => {
            return details.map((pokemonData: any) => {
              const correctName = pokemonData.name;
              const image = pokemonData.sprites.front_default;

              // Armamos opciones al azar
              const options = this.shuffleOptions(
                correctName,
                pokemonList.map(p => p.name)
              );

              return {
                image,
                question: '¿Quién es este Pokémon?',
                options,
                correct_answer: correctName
              } as Question;
            });
          })
        );
      })
    );
  }

  private getRandomIndexes(max: number, count: number): number[] {
    const indexes = new Set<number>();
    while (indexes.size < count) {
      indexes.add(Math.floor(Math.random() * max));
    }
    return Array.from(indexes);
  }

  private shuffleOptions(correct: string, allNames: string[]): string[] {
    const options = new Set<string>();
    options.add(correct);
    while (options.size < 4) {
      const randomName = allNames[Math.floor(Math.random() * allNames.length)];
      if (randomName !== correct) {
        options.add(randomName);
      }
    }
    return Array.from(options).sort(() => 0.5 - Math.random());
  }
}
