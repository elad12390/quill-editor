import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild
} from '@angular/core';
import Quill, {QuillOptionsStatic} from 'quill';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {MatFormFieldControl} from '@angular/material/form-field';
import {Subject} from 'rxjs';
// @ts-ignore
import * as Delta from 'quill-delta';
import {QUILL_STARTUP_INJECTION_TOKEN} from './quill-editor.injectionToken';


const DEFAULT_TOOLBAR_ACTIONS = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }],               // custom button values
  [{ list: 'ordered'}, { list: 'bullet' }],
  [{ script: 'sub'}, { script: 'super' }],      // superscript/subscript
  [{ indent: '-1'}, { indent: '+1' }],          // outdent/indent
  [{ direction: 'ltr' }],                         // text direction

  [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [ 'link', 'image', 'video', 'formula' ],          // add's image support
  [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean']                                         // remove formatting button
];

const DEFAULT_QUILL_OPTIONS = {
  modules: { toolbar: DEFAULT_TOOLBAR_ACTIONS },
  theme: 'snow',
};


@Component({
  selector: 'app-quill-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #editor [id]="id"></div>`,
  styles: [`
    @import url('//cdn.quilljs.com/1.3.6/quill.snow.css');
    @import url('//cdn.quilljs.com/1.3.6/quill.bubble.css');
    ::ng-deep app-quill-editor .ql-toolbar {
      direction: ltr;
    }
    ::ng-deep app-quill-editor.direction-rtl .ql-editor {
      direction: rtl;
      text-align: right;
    }
    ::ng-deep app-quill-editor.direction-ltr .ql-editor {
      direction: ltr;
      text-align: left;
    }
  `],
  providers: [{provide: MatFormFieldControl, useExisting: QuillEditorComponent}]
})
export class QuillEditorComponent implements AfterViewInit, AfterViewChecked, MatFormFieldControl<Delta>, ControlValueAccessor, OnDestroy {
/************* Initialization **************/
  /**
   * Running id for quill (for the case that the user has multiple quill's in view)
   */
    static nextId = 0;
    /**
     * Static initializer (for quill modules)
     */
    static initialized = false;
    /**
     * Get the editor element Ref
     */
    @ViewChild('editor', {static: false}) editorHTMLElement: ElementRef;
    /**
     * Set this htmlElement unique id
     */
    @HostBinding() id = `app-quill-editor-${QuillEditorComponent.nextId++}`;
    @HostBinding('class.direction-rtl') directionRtl = false;
    @HostBinding('class.direction-ltr') directionLtr = true;

/************* Inputs **************/

    /**
     * Set quill editor actions
     */
    @Input() toolbarActions = DEFAULT_TOOLBAR_ACTIONS;
    /**
     * Set quill editor options
     */
    @Input() options?: QuillOptionsStatic;
    /**
     * Use the Delta object as json
     */
    @Input() asJson = true;
    /**
     * This formControl's name inside the form
     */
    @Input() formControlName: string;
    public direction: string;
    /**
     * Setter and Getter for the contents of this formControl
     */
    @Input()
    set value(newVal: Delta) {
          this.editor?.setContents(newVal);
          this.stateChanges.next();
          this.cd.markForCheck();
    }
    get value(): Delta {
      const json = JSON.stringify(this.editor?.getContents());
      return this.asJson ? json : JSON.parse(json);
    }
    /**
     * Setter and getter for this formControl placeholder
     */
    @Input()
    set placeholder(plh: string) {
      this._placeholder = plh;
      this.stateChanges.next();
      this.cd.markForCheck();
    }
    get placeholder(): string {
      return this._placeholder;
    }

/************* MatFormFieldControl<Delta> Variable Implementations **************/

    /**
     * Stream that emits whenever the state of the control changes such that the parent `MatFormField`
     * needs to run change detection.
     */
    public readonly stateChanges = new Subject<void>();
    /** Whether the control is focused. */
    public readonly focused: boolean;
    /** Whether the control is empty. */
    public readonly empty: boolean;
    /** Whether the `MatFormField` label should try to float. */
    public readonly shouldLabelFloat: boolean;
    /** Whether the control is required. */
    public readonly required: boolean;
    /** Whether the control is disabled. */
    public readonly disabled: boolean;
    /** Whether the control is in an error state. */
    public readonly errorState: boolean;

/************* Private Variables **************/

    /** The quill editor class */
    private editor: Quill;
    /** The placeholder for this control. */
    // tslint:disable-next-line:variable-name
    private _placeholder: string;
    /**
     * The registered callback function called when an input event occurs on the input element.
     */
    private onChange: (change: any) => any = () => {};
    /**
     * The registered callback function called when a blur event occurs on the input element.
     */
    private onTouched: () => void = () => {};

/************* Lifecycle **************/

    constructor(
      @Optional() @Self() public ngControl: NgControl,
      @Optional() @Inject(QUILL_STARTUP_INJECTION_TOKEN) startupFunction: () => void,
      private cd: ChangeDetectorRef) {
      if (!QuillEditorComponent.initialized) {
        if (startupFunction && typeof startupFunction === 'function') {
          startupFunction();
        }
        console.log('Quill Module: initialized');
        QuillEditorComponent.initialized = true;
      }
      // Replace the provider from above with this.
      if (this.ngControl != null) {
        // Setting the value accessor directly (instead of using the providers) to avoid running into a circular import.
        this.ngControl.valueAccessor = this;
      }
    }

  /**
   * Create the quill editor, with the settings and tools provided.
   */
    ngAfterViewInit(): void {
      // get the default options
      let ops: QuillOptionsStatic = DEFAULT_QUILL_OPTIONS;

      // If there's a custom placeholder set it
      if (this._placeholder) {
        ops = {
          ...ops,
          placeholder: this._placeholder
        };
      }

      // If there are custom options set them
      if (this.options) {
        ops = {
          ...ops,
          ...this.options
        };
      }

      // If there custom toolbar actions set them instead of default value
      if (this.toolbarActions) {
        ops = {
          ...ops,
          modules: {
            ...ops.modules,
            toolbar: [
              ...this.toolbarActions
            ]
          }
        };
      }

      // Create the quill editor
      this.editor = new Quill(this.editorHTMLElement.nativeElement, ops);

      // bind this onChange to quill's onChange
      this.editor?.on('editor-change', () => {
        const contents = this.editor?.getContents();
        this.onChange(this.asJson ? JSON.stringify(contents) : contents);
      });

      // bind this onTouched to quill's onTouched
      this.editor?.on('selection-change', () => { this.onTouched(); });
    }

    /**
     * After the view is checked check if component direction changed, and if it did, set the editor direction and class
     * Do it only if the value is empty, because if it's not, it should probably already been set
     */
    ngAfterViewChecked(): void {
      if (this.isEmpty()) {
        const dir = getComputedStyle(this.editorHTMLElement.nativeElement).direction;
        if (this.direction === dir) { return; }

        this.direction = dir;
        this.directionLtr = dir === 'ltr';
        this.directionRtl = dir === 'rtl';
        this.editor?.format('direction', dir);
        this.editor?.format('textAlign', dir === 'rtl' ? 'right' : 'left');
      }
    }

    /** Unsubscribes from the stateChanges subject */
    ngOnDestroy(): void {
      this.stateChanges.complete();
    }
    /** Is empty */
    isEmpty(): boolean {
      if ((this.editor.getContents()?.ops || []).length !== 1) { return false; }
      return this.editor.getText().trim().length === 0;
    }
/************* ControlValueAccessor Implementation **************/

    /**
     * Sets the "value" property on the input element.
     */
    writeValue(obj: Delta | string | null): void {
      setTimeout(() => {
        if (!obj) {
          this.editor?.setContents(new Delta());
        } else if (typeof(obj) === 'string') {
          const delta = JSON.parse(obj) as Delta;
          if (delta?.ops) { this.editor?.setContents(delta); }
        } else if (obj instanceof Delta) {
          this.editor?.setContents(new Delta());
        }
      }, 0);
    }
    /**
     * Register a listener for change events.
     *
     * @param fn The method that is called when the value changes
     */
    registerOnChange(fn: (change: any) => void): void { this.onChange = fn || (() => {}); }
    /**
     * Registers a function called when the control is touched.
     *
     * @param fn The method that is called when the control is touched
     */
    registerOnTouched(fn: () => void): void { this.onTouched = fn || (() => {}); }
    /**
     * Sets the "disabled" property on the input element.
     */
    setDisabledState?(isDisabled: boolean): void { if (isDisabled) { this.editor?.disable(); } else { this.editor?.enable(); } }
    /** Sets the list of element IDs that currently describe this control. */
    setDescribedByIds(ids: string[]): void {
      setTimeout(() => {
        this.editorHTMLElement?.nativeElement.setAttribute('aria-describedby', ids.join(' '));
      }, 0);
    }

/************* MatFormFieldControl<Delta> Implementation **************/

    /** Handles a click on the control's container. */
    onContainerClick(event: MouseEvent): void {
      if ((event.target as Element).tagName.toLowerCase() !== 'input') {
        this.editorHTMLElement?.nativeElement.querySelector('input')?.focus();
      }
    }
}
