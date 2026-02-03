class SyncRetry {
    async executeWithRetry(fn, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) console.log(`[Retry] Attempt ${attempt}/${maxRetries}`);
                return await fn();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                console.warn(`[Retry] Failed, waiting ${delay}ms before retry. Error: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }
}

export default new SyncRetry();
