import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthData} from '../auth-data.model';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';

import {environment} from '../../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private token: string;
    private authStatusListener = new Subject<boolean>();
    private userNameListener = new Subject<string>();
    private isAuthenticated = false;
    private tokenTimer: NodeJS.Timer;
    private userId: string;
    private userName: string;

    constructor(private http: HttpClient, private router: Router) {
    }


    createUser(email: string, password: string, fullName: string) {
        const authData: AuthData = {
            email: email,
            password: password,
            fullName: fullName
        };
        this.http.post(BACKEND_URL + 'signup', authData)
            .subscribe(response => {
                console.log(response);
                this.router.navigate(['/']);
            }, error => {
                this.authStatusListener.next(false);
            });
    }

    login(email: string, password: string) {
        const authData: AuthData = {
            email: email,
            password: password
        };
        this.http.post<{ token: string, expiresIn: number, userId: string, fullName: string }>(BACKEND_URL + 'login', authData)
            .subscribe(response => {
                this.token = response.token;
                if (response.token) {
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.userId = response.userId;
                    this.userName = response.fullName;
                    this.authStatusListener.next(true);
                    this.userNameListener.next(this.userName);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    console.log(expirationDate);
                    this.saveAuthData(this.token, expirationDate, this.userId, this.userName);
                    this.router.navigate(['/']);
                }
            }, error => {
                this.authStatusListener.next(false);
            });
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) {
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        console.log(authInformation, expiresIn);
        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.userName = authInformation.userName;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
            this.userNameListener.next(this.userName);
        }
    }

    private setAuthTimer(duration: number) {
        console.log('Setting timer: ' + duration);
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getUserName() {
        return this.userName;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getUserNameListener() {
        return this.userNameListener.asObservable();
    }

    getToken() {
        return this.token;
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.userNameListener.next('');
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string, userName: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        if (!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId,
            userName: userName
        };
    }
}
