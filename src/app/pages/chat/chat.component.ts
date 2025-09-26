import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);
  private userSessionService = inject(UserSessionService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatForm!: FormGroup;
  messages$!: Observable<any[]>;
  isLoggedIn = false;
  userEmail: string | null = null;

  ngOnInit(): void {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(100)]],
    });

    this.isLoggedIn = this.userSessionService.isLoggedIn();

    console.log(this.isLoggedIn);
    console.log(this.userSessionService.getUserName);

    this.userEmail = this.userSessionService.getUserEmail();

    if (this.isLoggedIn && this.userEmail) {
      const messagesRef = collection(this.firestore, 'chat-messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      this.messages$ = collectionData(messagesQuery, { idField: 'id' });

      this.messages$.subscribe(() => {
        setTimeout(() => this.scrollToBottom(), 100);
      });
    }
  }

  adjustTextArea(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }
  onEnter(event: Event) {
  const keyboardEvent = event as KeyboardEvent;
  if (!keyboardEvent.shiftKey) {
    keyboardEvent.preventDefault();
    this.sendMessage();
  }
}

  async sendMessage() {
    const messageContent = this.chatForm.get('message')?.value;
    if (!this.userEmail || !messageContent) return;

    await addDoc(collection(this.firestore, 'chat-messages'), {
      message: messageContent,
      email: this.userEmail,
      timestamp: new Date(),
    });

    this.chatForm.reset();
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }
}
