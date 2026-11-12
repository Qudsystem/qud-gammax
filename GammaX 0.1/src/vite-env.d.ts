/// <reference types="vite/client" />

interface Window {
    spark: {
        llm: (prompt: string, model: string, json?: boolean) => Promise<string>;
    }
}
