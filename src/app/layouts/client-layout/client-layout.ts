import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeader } from '../../shared/components/public-header/public-header';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, PublicHeader],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css'
})
export class ClientLayout {}
