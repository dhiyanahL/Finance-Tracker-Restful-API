import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const EXCHANGE_RATE_API_URL = "https://openexchangerates.org/api";
const APP_ID = process.env.OPEN_EXCHANGE_RATE_APP_ID;

console.log("API Key Loaded: ", APP_ID);

export const getExchangeRate = async (fromCurrency, toCurrency) => {
    try {
        console.log(`Fetching exchange rate from ${fromCurrency} to ${toCurrency}`);

        // Make the request to the API
        const response = await axios.get(
            `${EXCHANGE_RATE_API_URL}/latest.json?app_id=${APP_ID}`
        );

        // Log the full response data for debugging
        console.log("Exchange Rate API Response:", response.data);

        // Check if rates exist in the response
        if (response.data && response.data.rates) {
            // Log the available rates in the response for debugging
            console.log("Available exchange rates:", response.data.rates);

            // Check if the rates for the given currencies exist in the response
            if (response.data.rates[toCurrency] && response.data.rates[fromCurrency]) {
                // Calculate the exchange rate
                const rate = response.data.rates[toCurrency] / response.data.rates[fromCurrency];
                console.log(`Exchange rate from ${fromCurrency} to ${toCurrency}:`, rate);
                return rate || null;
            } else {
                console.error(`Rates for ${fromCurrency} or ${toCurrency} not found in the response.`);
                return null;
            }
        } else {
            console.error("No rates found in the API response.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching exchange rates:", error.message || error);
        // Log the entire error for more detailed debugging
        console.error(error);
        return null;
    }
};
