class DeepseekAPI {
    constructor() {
        this.endpoint = CONFIG.API_ENDPOINT;
        this.apiKey = CONFIG.API_KEY;
    }

    async sendMessage(message, onProgress = null) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: CONFIG.MODEL_NAME,
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    max_tokens: CONFIG.MAX_TOKENS,
                    temperature: CONFIG.TEMPERATURE,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const reader = response.body.getReader();
            let partialResponse = '';

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                partialResponse += chunk;

                if (onProgress) {
                    onProgress(partialResponse);
                }
            }

            return partialResponse;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }
}

const api = new DeepseekAPI(); 