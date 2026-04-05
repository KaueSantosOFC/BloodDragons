import { Injectable, signal } from '@angular/core';

export type UserRole = 'GM' | 'PLAYER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  campaigns: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock current user for demonstration
  currentUser = signal<User | null>({
    id: 'user_gm_1',
    email: 'gm@eldenbloodmoon.com',
    displayName: 'Mestre',
    role: 'GM',
    campaigns: ['camp_1']
  });

  loginAs(role: UserRole) {
    if (role === 'GM') {
      this.currentUser.set({
        id: 'user_gm_1',
        email: 'gm@eldenbloodmoon.com',
        displayName: 'Mestre',
        role: 'GM',
        campaigns: ['camp_1']
      });
    } else {
      this.currentUser.set({
        id: 'user_player_1',
        email: 'player@eldenbloodmoon.com',
        displayName: 'Guerreiro Bob',
        role: 'PLAYER',
        campaigns: ['camp_1']
      });
    }
  }

  logout() {
    this.currentUser.set(null);
  }
}
