class SyncMetrics {
    constructor() {
        this.metrics = {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            averageTime: 0,
            totalTime: 0,
            lastError: null,
            lastSyncTimestamp: null
        };
    }

    recordSync(success, duration, error = null) {
        this.metrics.totalSyncs++;
        this.metrics.lastSyncTimestamp = new Date();

        if (success) {
            this.metrics.successfulSyncs++;
        } else {
            this.metrics.failedSyncs++;
            this.metrics.lastError = error?.message || String(error);
        }

        this.metrics.totalTime += duration;
        // Avoid division by zero
        this.metrics.averageTime = this.metrics.successfulSyncs > 0
            ? Math.round(this.metrics.totalTime / this.metrics.successfulSyncs)
            : 0;
    }

    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalSyncs > 0
                ? ((this.metrics.successfulSyncs / this.metrics.totalSyncs) * 100).toFixed(2) + '%'
                : '0%'
        };
    }
}

export default new SyncMetrics();
