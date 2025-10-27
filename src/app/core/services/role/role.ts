import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RoleModel } from '../../../models/role';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Role {
  private readonly API_URL = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<RoleModel[]> {
    return this.http.get<RoleModel[]>(this.API_URL);
  }
}
