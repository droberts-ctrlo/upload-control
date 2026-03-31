/**
 * Type to represent a function that is called when the upload progress changes
 * @param loaded The number of bytes that have been uploaded
 * @param total The total number of bytes to upload
 */
export type ProgressFunction = (loaded: number, total: number) => void;

export type RequestMethod = 'PUT'|'POST'|'GET'|'DELETE'|'PATCH';

/**
 * Type to represent an object similar to an XMLHttpRequest object
 */
export type XmlHttpRequestLike = {
    open: (method: string, url: string) => void,
    onabort?: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any) | null,  
    onerror?: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any) | null,  
    onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null,  
    send: (data?: Document | XMLHttpRequestBodyInit | null | undefined) => void,
    setRequestHeader: (header: string, value: string) => void,
    readyState: number,
    status: number,
    responseText: string,
    upload?: {
        onprogress?: ((e: ProgressEvent) => void) | null
    };
};

/**
 * Upload data to a server endpoint
 * @param url The endpoint to upload to
 * @param data The form data to upload
 * @param method The method to use, either POST, PUT, or GET
 * @param onProgress A callback that is called when the upload progress changes
 * @returns The JSON response from the server
 */
export async function upload<T = unknown>(url: string | URL, data?: FormData | object, method: RequestMethod = 'POST', onProgress: ProgressFunction = () => { }): Promise<T> {
    const uploader = new Uploader(url, method);
    uploader.onProgress(onProgress);
    return uploader.upload(data);
}

/**
 * Helper class to upload form data to a server endpoint
 */
export class Uploader {
    private onProgressCallback?: ProgressFunction;
    private url: string | URL;
    private method: RequestMethod;

    /**
     * Create a new uploader instance
     * @param url The URL to bind the uploader to
     * @param method The request method to use
     */
    constructor(url: string | URL, method: RequestMethod) {
        this.url = url;
        this.method = method;
    }

    /**
     * Set a callback that is called when the upload progress changes
     * @param callback A callback that is called when the upload progress changes
     */
    onProgress(callback: ProgressFunction) {
        this.onProgressCallback = callback;
    }

    /**
     * Upload form data to a server endpoint
     * @param data The form data or JSON object to upload
     * @returns A promise that resolves to the JSON response from the server
     */
    async upload<T>(data?: FormData | object): Promise<T> {
        return new Promise((resolve, reject) => {
            const request: XmlHttpRequestLike & XMLHttpRequest = new XMLHttpRequest();
            request.open(this.method, this.url.toString());
            request.onabort = () => reject('aborted');
            request.onerror = () => reject('error');
            request.upload.onprogress = (e: ProgressEvent) => {
                if(!e.lengthComputable) this.onProgressCallback?.(e.loaded, 0);
                this.onProgressCallback?.(e.loaded, e.total);
            };
            request.onreadystatechange = () => {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        resolve(JSON.parse(request.responseText));
                    } else {
                        reject(request.responseText);
                    }
                }
            };

            if (data instanceof FormData) {
                request.send(data);
            } else {
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(data));
            }
        });
    }
}
