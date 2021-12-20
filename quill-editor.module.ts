import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {QuillEditorComponent} from './quill-editor.component';
import {QUILL_STARTUP_INJECTION_TOKEN} from './quill-editor.injectionToken';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [QuillEditorComponent],
  exports: [QuillEditorComponent],
  imports: [CommonModule]
})
export class QuillEditorModule {
  /**
   * can provide startup for the quill editor module in order to add more modules on initialization
   * @param startup: Callback to run when initializing
   */
  static forRoot(startup: () => void = () => {}): ModuleWithProviders<QuillEditorModule> {
    return {
      ngModule: QuillEditorModule,
      providers: [
        {provide: QUILL_STARTUP_INJECTION_TOKEN, useValue: startup}
      ]
    };
  }

}
