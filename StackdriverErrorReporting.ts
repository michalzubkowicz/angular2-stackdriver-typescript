/**
 * Copyright 2018 Michał Zubkowicz. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Work based on https://github.com/GoogleCloudPlatform/stackdriver-errors-js
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';

const baseAPIUrl = 'https://clouderrorreporting.googleapis.com/v1beta1/projects/';

export interface StackDriverErrorReportingSSRConfigContext {
    user?: string;
}

export interface StackDriverErrorReportingSSRConfig {
    context?: StackDriverErrorReportingSSRConfigContext;
    key: string;
    projectId: string;
    service: string;
    version?: string;
    targetUrl?: string;
}

export interface ServiceContext {
    version: string;
    service: string;
}

export interface SourceLocation {
    filePath: string;
    lineNumber: number;
    functionName: string;
}

export interface SourceReference {
    repository: string;
    revisionId: string;
}

export interface ErrorContext {
    httpRequest?: any; //unused in ssr
    user?: string;
    reportLocation?: SourceLocation;
    sourceReferences?: SourceReference;
}

export interface ReportedErrorEvent {
    eventTime?: string;
    serviceContext: ServiceContext;
    message: string;
    context: ErrorContext;
}

export class StackdriverErrorReporterSSR {
    private apiKey: string;
    private projectId: string;
    private targetUrl: string | undefined;
    private context: ErrorContext;
    private serviceContext: {
        version: string;
        service: string;
    };
    private http: HttpClient;

    constructor(config: StackDriverErrorReportingSSRConfig, http: HttpClient) {
        this.http = http;

        if (!config.key) {
            throw new Error('Cannot initialize: No API key or target url provided.');
        }
        if (!config.projectId) {
            throw new Error('Cannot initialize: No project ID or target url provided.');
        }

        this.apiKey = config.key;
        this.projectId = config.projectId;
        this.targetUrl = config.targetUrl;
        this.context = config.context || {};
        this.serviceContext = {
            service: config.service || 'web',
            version: config.version,
        };
    }

    /**
     * Report an error to the Stackdriver Error Reporting API
     * @param {Error|String} err - The Error object or message string to report.
     */
    report(err: Error | string) {
        if (!err) {
            return;
        }

        if (typeof err === 'string') {
            // Transform the message in an error, use try/catch to make sure the stacktrace is populated.
            try {
                throw new Error(err as any);
            } catch (e) {
                err = e;
            }
        }
        try {

            const payload: ReportedErrorEvent = {
                serviceContext: this.serviceContext,
                context: this.context,
                message: (err as Error).message + '. Stacktrace: ' + (err as Error).stack,
            };

            this.sendErrorPayload(payload);
        } catch (e) {
            console.error('Error when sending error report', e);
        }
    }

    sendErrorPayload(payload: ReportedErrorEvent) {
        const defaultUrl = baseAPIUrl + this.projectId + '/events:report?key=' + this.apiKey;
        const url = this.targetUrl || defaultUrl;
        this.http.post<ReportedErrorEvent>(url, payload, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        }).subscribe();
    }

    setUser(user) {
        this.context.user = user;
    }
}

