import { Component, OnInit, Input } from '@angular/core';
import { UsersService } from './../services/users.service';



@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  public username: string;


  constructor(private UsersService: UsersService) { }

  ngOnInit(): void {
    this.username = this.UsersService.getSessionName();
  }

  public borrarDatosSession(){
    this.UsersService.clearSession();
  }

}
