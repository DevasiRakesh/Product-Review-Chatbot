
class ChatbotAPI {
    constructor() {
        this.apiKey = 'AIzaSyBEUciXJl9qtmaIv8MwCtxWaMTD8fSiP5k';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.conversationHistory = [];
    }

    async sendMessage(message) {
        try {
            // First analyze if this is a product review request
            const isProductReview = await this.analyzeQuery(message);
            
            if (!isProductReview) {
                return "I specialize in product reviews only. Please ask about reviewing a specific product.";
            }

            const reviewPrompt = `
        Provide a detailed review of the product mentioned in this query: "${message}".
        Your response MUST:
        1. Cover key features and performance
        2. Mention pros and cons
        3. Include an overall rating at the end in this exact format: [Overall Rating: X/10]
        
        Example format:
        "The product offers... [Pros]... [Cons]... [Overall Rating: 7.5/10]"
        `;
            // Rest of your existing API call logic...
            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: reviewPrompt }]
            });

            const url = `${this.baseUrl}?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: this.conversationHistory,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const aiResponse = this.parseResponse(data);
            
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: aiResponse }]
            });

            return aiResponse;
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }

    async analyzeQuery(message) {
        const analysisPrompt = `
        Analyze the following user query and determine if it is requesting a review or opinion about a specific PHYSICAL PRODUCT.
        Respond with ONLY 'true' or 'false' based on these strict criteria:
        
        1. MUST be asking for a review, opinion, or evaluation
        2. MUST be about a tangible, physical product (not services, companies, digital content, places, or abstract concepts)
        3. MUST NOT be about a company/brand unless specifically mentioning a physical product from that brand
          
        Examples:
        "How good is the iPhone 15?" → true
        "Review of Google" → false
        "Thoughts on Google Pixel phone" → true
        "Is Google Workspace good?" → false
        "Review of Google Nest thermostat" → true
        
        Query: "${message}"
        `;
    
        const url = `${this.baseUrl}?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: analysisPrompt }]
                }],
                generationConfig: {
                    temperature: 0.0,
                    maxOutputTokens: 10
                }
            })
        });
    
        if (!response.ok) {
            console.error('Analysis failed, defaulting to false');
            return false;
        }
    
        const data = await response.json();
        const result = this.parseResponse(data).trim().toLowerCase();
        return result === 'true';
    }

    parseResponse(data) {
        try {
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('Error parsing response:', error);
            return "I couldn't process that response. Please try again.";
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

// Export the class if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotAPI;
}
