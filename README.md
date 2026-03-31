# Upload Control

Yet another async control for AJAX requests

## Usage

### Basic Usage

For basic requests there is a helper function with the following signature:

```typescript
async function upload<T>(url: string | URL, data: FormData | object, method: "PUT"|"POST"|"GET"|"DELETE"|"PATCH" = 'POST', onProgress: (loaded: number, total: number): void = ()=>{}): Promise<T>
```

This is enough for most use-cases, but this function directly calls the `Upload` class for finer control; this is exported as:

```typescript
class Uploader {
    constructor(url: string | URL);
    onProgress(callback: (loaded: number, total: number) => void): void;
    async upload<T>(data?: FormData | object): Promise<T>;
}
```
