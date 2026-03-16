import api from '@/lib/api'

class LoggerService {
    /**
     * Logs a standard action (Create, Update, Delete)
     */
    async log(actionType, tableName, recordId, details = null, status = 'success') {
        try {
            const logEntry = {
                action_type: actionType,
                table_name: tableName,
                record_id: recordId ? String(recordId) : null,
                details: details,
                status: status
            }

            await api.post('/logs', logEntry)
        } catch (err) {
            console.error('LoggerService Error:', err)
        }
    }

    async logError(actionType, tableName, error, details = null) {
        await this.log(actionType, tableName, null, { error: error.message || error, ...details }, 'error')
    }
}

export const logger = new LoggerService()
