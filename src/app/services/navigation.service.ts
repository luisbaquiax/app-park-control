// navigation.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private refreshMenuSubject = new Subject<void>();
  refreshMenu$ = this.refreshMenuSubject.asObservable();

  triggerRefreshMenu() {
    this.refreshMenuSubject.next();
  }
}