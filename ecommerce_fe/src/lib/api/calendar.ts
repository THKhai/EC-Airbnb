const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const calendarAPI = {
    /**
     * Update calendar after auction winner
     * Calls POST /winner/after_winner/{auction_id}
     */
    async afterWinner(auctionId: string, propertyId: number): Promise<any> {
        try {
            const response = await fetch(
                `${API_URL}/winner/after_winner/${auctionId}?property_id=${propertyId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Error calling after_winner:", error);
            throw error;
        }
    }
};