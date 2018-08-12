import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LandingpageComponent} from './landingpage/landingpage.component';
import {WrapperComponent} from './wrapper/wrapper.component';
import {LabelingGuard} from './labeling.guard';

const routes: Routes = [
  {path: 'landing', component: LandingpageComponent},
  { path: 'labeling', component: WrapperComponent, canActivate: [LabelingGuard]},
  { path: '', redirectTo: '/landing', pathMatch: 'full'},
  { path: '**', component: LandingpageComponent }
];
export const routingProviders = [LabelingGuard];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule {}
