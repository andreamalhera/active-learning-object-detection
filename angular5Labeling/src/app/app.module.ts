import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LabelingComponent } from './labeling/labeling.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AnnotationService} from './services/annotation.service';
import { SubimageComponent } from './subimage/subimage.component';
import { RoisTableComponent } from './rois-table/rois-table.component';
import { ClassTableComponent } from './class-table/class-table.component';
import {SubimageService} from './services/subimage.service';
import { LabelingService} from './services/labeling.service';
import {ConfigService} from './services/config.service';
import { LandingpageComponent } from './landingpage/landingpage.component';
import {AppRoutingModule, routingProviders} from './/app-routing.module';
import {DataService} from './services/data.service';
import { WrapperComponent } from './wrapper/wrapper.component';

@NgModule({
  exports: [
    ScrollDispatchModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  declarations: [],
  imports: []
})
export class MaterialModule {}

@NgModule({
  declarations: [
    SubimageComponent,
    RoisTableComponent,
	ClassTableComponent,
    AppComponent,
    LandingpageComponent,
    LabelingComponent,
    WrapperComponent,
    ToolbarComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  providers: [routingProviders, AnnotationService, SubimageService, LabelingService, ConfigService, DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
