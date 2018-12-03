import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ErrorComponent} from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        if (err.error.message) {
          errorMessage = err.error.message;
        }
        this.dialog.open(ErrorComponent, {
          data: {message: errorMessage}
        });
        return throwError(err);
      })
    );
  }

}
