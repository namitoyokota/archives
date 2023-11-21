/*tslint:disable*/
import { Component } from '@angular/core';
import { CommonHttpClient, HttpClientOptions, PolicyOptions } from '@galileo/web_common-http';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private http: CommonHttpClient) {

    setTimeout( async () => {

      const options = new HttpClientOptions({
        useStandardAuthentication: false
      });

      this.http.get('https://jsonplaceholder.typicode.com/todos/1').subscribe((data) => {
        console.info('Auth Data', data);
      });

      console.info('Make call to get data');
      this.http.get('https://jsonplaceholder.typicode.com/todos/1', options).subscribe((data) => {
        console.info('Data', data);
        this.http.setAuthorizationToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MTA5MDg3NS1mYmMyLTQwZTEtODFiNC05OTQyZTFjODdjY2UiLCJqdGkiOiJqdFdSMzVha1IrU1ZxVGljb09yL2Y0NmsvRmtJRHh5b2FMUFhEbmJFVTJrPSIsIm5iZiI6MTU0OTY1NDgzOCwiZXhwIjoxNTgxMTkwODM4LCJpc3MiOiJHYWxpbGVvU2l0ZSIsImF1ZCI6IkdhbGlsZW9DbGllbnQifQ.UlGmYutwCgGZmV-P5UEpIMTmnO8yIkq_ptRSKXGqHfU');
      });

    });
  }
}
