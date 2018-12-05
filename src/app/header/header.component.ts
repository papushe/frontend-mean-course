import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth-service/auth.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

    private authStatusSubs: Subscription;
    private userNameSubs: Subscription;
    userIsAuthenticated = false;
    userName: string;

    constructor(private authService: AuthService) {
    }

    ngOnInit() {
        this.userName = this.authService.getUserName();
        this.userNameSubs = this.authService.getUserNameListener()
            .subscribe(userName => {
            this.userName = userName;
        });
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSubs = this.authService.getAuthStatusListener()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
    }

    onLogout() {
        this.authService.logout();
    }

    ngOnDestroy() {
        this.authStatusSubs.unsubscribe();
        this.userNameSubs.unsubscribe();
    }

}
