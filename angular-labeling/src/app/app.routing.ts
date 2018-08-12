import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { IconsComponent } from './icons/icons.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import {LabelingComponent} from './labeling/labeling.component';
import {TablesComponent} from "./tables/tables.component";

export const appRoutes: Routes =[
    { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'icons',          component: TablesComponent },
    { path: 'statistics',  component: NotificationsComponent },
    { path: 'upload',        component: UpgradeComponent },
    { path: 'dashboard',      component: HomeComponent },
    { path: 'labeling',           component: LabelingComponent}


];


export const routingComponents = [TablesComponent,IconsComponent, NotificationsComponent, UpgradeComponent, HomeComponent, LabelingComponent];
export const AppRoutingModule = RouterModule.forRoot(appRoutes);

