import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'dashboard', title: 'Dashboard',  icon: 'pe-7s-graph', class: '' },
    { path: 'labeling', title: 'Labeling Tool',  icon:'pe-7s-magic-wand', class: '' },
    { path: 'statistics', title: 'Statistics',  icon:'pe-7s-science', class: 'active-pro' },
    { path: 'upload', title: 'Upload new Images',  icon:'pe-7s-cloud-upload', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
}
