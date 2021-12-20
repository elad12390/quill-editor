import {InjectionToken} from '@angular/core';

export const QUILL_STARTUP_INJECTION_TOKEN = new InjectionToken<() => void>('QUILL_STARTUP_FUNCTION');
