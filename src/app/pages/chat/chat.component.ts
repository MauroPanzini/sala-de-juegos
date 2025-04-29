import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, orderBy, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatInputModule]
})
export class ChatComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  chatForm!: FormGroup;
  messages$!: Observable<any[]>;
  user: User | null = null;
  isLoggedIn = false;

  ngOnInit(): void {
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });

    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      this.isLoggedIn = !!user;

      if (this.isLoggedIn) {
        const messagesRef = collection(this.firestore, 'chat-messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
        this.messages$ = collectionData(messagesQuery, { idField: 'id' });
      }
    });
  }

  async sendMessage() {
    const messageContent = this.chatForm.get('message')?.value;

    if (!this.user || !messageContent) return;

    await addDoc(collection(this.firestore, 'chat-messages'), {
      message: messageContent,
      email: this.user.email,
      timestamp: new Date()
    });

    this.chatForm.reset();
  }
}
