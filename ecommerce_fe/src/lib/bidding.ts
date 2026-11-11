import { API_ORIGIN } from '@/lib/api/urls'
import {BidData} from "@/types/bidding";
const API_URL = `${API_ORIGIN}/api`;
export const biddingAPI = {
    async fetch_sending_bid(bidData: BidData) {
        try {
            const getToken = typeof window !== 'undefined' ? (window as any).__getAccessTokenSilently : null
            const token: string | null = getToken ? await getToken() : null
            if (!token) throw new Error('Please sign in to place a bid')
            const response = await fetch(`${API_URL}/sending_bid`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bidData)
            })
            if(!response.ok) {
                throw new Error(`Failed to fetch sending bid: ${response.status}`);
            }
            return await response.json();
        }
        catch(error) {
            console.error('Error fetching sending bid:', error);
            throw error;
        }
    },

    async fetch_receiving_bid() {
        try{
            const response = await fetch(`${API_URL}/receiving_bid`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            if(!response.ok) {
                throw new Error(`Failed to fetch receiving bid: ${response.status}`);
            }
            return await response.json();
        }
        catch(error) {
            console.error('Error fetching receiving bid:', error);
            throw error;
        }
    }
}