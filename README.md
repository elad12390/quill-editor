<h1>Angular Quill Reactive FormControl</h1>
<h2>In order to use this module please do the following:</h2>
<ol>
  <li>Run: <code>npm i quill @types/quill</code></li>
  <li>Copy this folder into the shared folder</li>
  <li>
    For this step you have multiple options:<br/>
    <ul>
      <li>
        Without quill extra modules:
        <ul>
          <li>Import the QuillEditorModule in the shared module as is</li>
          <li>
            <code>
              @NgModule({<br/>
              &nbsp;declarations: [...classes],<br/>
              &nbsp;imports: [<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;...imports,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<b>QuillEditorModule</b><br/>
              &nbsp;],<br/>
              &nbsp;exports: [...classes]<br/>
              })<br/>
              export class ...Module { }
            </code>
          </li>
        </ul>
      </li>
      <li>
        With quill extra modules:
        <ul>
          <li>Import the QuillEditorModule with forRoot</li>
          <li>
            <code>
              @NgModule({<br/>
              &nbsp;declarations: [...classes],<br/>
              &nbsp;imports: [<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;...imports,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<b>QuillEditorModule.forRoot(() => {<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log('here you can write all the initialization code')<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;})</b><br/>
              &nbsp;],<br/>
              &nbsp;exports: [...classes]<br/>
              })<br/>
              export class ...Module { }
            </code>
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>And you're done! You can now use the form control <code>app-quill-editor</code></li>
</ol>
