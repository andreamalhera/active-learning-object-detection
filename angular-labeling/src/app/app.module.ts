import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.routing';
import { NavbarModule } from './shared/navbar/navbar.module';
import { FooterModule } from './shared/footer/footer.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { LbdModule } from './lbd/lbd.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LabelingComponent } from './labeling/labeling.component';
import { TablesComponent } from './tables/tables.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import {CanvasWhiteboardModule} from "ng2-canvas-whiteboard";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LabelingComponent,
        TablesComponent,
        TypographyComponent,
        IconsComponent,
        NotificationsComponent,
        UpgradeComponent

  ],
    imports: [

        CanvasWhiteboardModule,
        BrowserModule,
        FormsModule,
        HttpModule,
        NavbarModule,
        FooterModule,
        SidebarModule,
        RouterModule,
        AppRoutingModule,
        LbdModule
  ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
