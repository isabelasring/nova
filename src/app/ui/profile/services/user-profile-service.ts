import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import { CURRENT_USER }
from '../mocks/current-user-mock';

import { UserProfile }
from '../models/user-profile-model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private readonly profileSource =
    signal<UserProfile>({ ...CURRENT_USER });

  readonly profile = this.profileSource.asReadonly();

  readonly editing = signal(false);

  readonly draft = signal<UserProfile>({ ...CURRENT_USER });

  readonly draftInitials = computed(() =>
    this.buildInitials(this.draft().nombre)
  );

  startEdit(): void {

    this.draft.set({ ...this.profile() });
    this.editing.set(true);

  }

  cancelEdit(): void {

    this.draft.set({ ...this.profile() });
    this.editing.set(false);

  }

  updateDraft(patch: Partial<UserProfile>): void {

    this.draft.update(current => ({
      ...current,
      ...patch
    }));

  }

  saveEdit(): void {

    const current = this.profile();

    this.profileSource.set({
      ...current,
      celular: this.draft().celular
    });

    this.draft.set({ ...this.profileSource() });
    this.editing.set(false);

  }

  private buildInitials(nombre: string): string {

    const parts = nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return '';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }

}