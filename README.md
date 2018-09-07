# angular2-stackdriver-typescript
Angular 2-6 stackdriver reporting class written in TypeScript
Based on: https://github.com/GoogleCloudPlatform/stackdriver-errors-js

This class can be used with Angular Error handler to report errors to Google Stackdriver. 

At first in ErrorHandler create instance of class
```javascript
constructor(injector: Injector) {
        this.errorReportingInstance = new StackdriverErrorReporterSSR({
                key: STACKDRIVER_API_KEY,
                projectId: STACKDRIVER_PROJECT_ID,
                service: STACKDRIVER_SERVICE,
            }, injector.get(HttpClient));
    }
```


then you can report errors with:
```javascript
this.errorReportingInstance.report()
```
