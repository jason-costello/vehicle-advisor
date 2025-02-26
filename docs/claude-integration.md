# Claude AI Integration Guide

This document explains how the Vehicle Advisor application integrates with Anthropic's Claude AI to generate negotiation strategies.

## Overview

The Vehicle Advisor application uses Claude, an AI assistant created by Anthropic, to generate personalized negotiation strategies for vehicle purchases. Claude analyzes vehicle details, safety data, and market pricing to create tailored advice for buyers.

## API Integration

The integration uses Claude's API to send vehicle data and receive structured negotiation strategies. The implementation can be found in `src/lib/api/claude.ts`.

### Required Environment Variables

- `VITE_CLAUDE_API_KEY`: Your Claude API key from Anthropic
- `VITE_CLAUDE_API_URL`: The Claude API endpoint (typically `https://api.anthropic.com/v1/messages`)

## Setup Instructions

1. Sign up for an Anthropic account at [console.anthropic.com](https://console.anthropic.com/)
2. Generate an API key from the console
3. Add your API key to the `.env` file:
   ```
   VITE_CLAUDE_API_KEY=your_api_key_here
   ```

## How It Works

1. The application collects vehicle data (VIN details, safety information, market pricing)
2. This data is formatted into a structured prompt for Claude
3. The prompt is sent to Claude's API with specific instructions to generate a negotiation strategy
4. Claude returns a JSON response with the negotiation strategy
5. The application parses and displays this strategy to the user

## Claude Prompt Design

The prompt sent to Claude includes:
- Vehicle details (year, make, model, trim)
- Mileage information
- Safety ratings and recall data
- Current price and market average comparisons
- Price factors affecting the vehicle's value

Claude is instructed to return a structured JSON response containing:
- Target price recommendation
- Starting offer price
- Key negotiation points
- Vehicle advantages and concerns
- Sample negotiation scripts
- Additional tips

## Fallback Mechanism

If the Claude API is unavailable or returns an error, the application includes a fallback mechanism that generates a basic negotiation strategy using local logic. This ensures users always receive some guidance even if the AI service is temporarily unavailable.

## Response Format

Claude returns a structured JSON response matching the `NegotiationStrategy` interface defined in `src/lib/types/marketdata.ts`.

## Limitations

- Claude requires an active API key and internet connection
- The quality of the strategy depends on the accuracy of the input data
- Currently uses Claude 3 Haiku (can be upgraded to other Claude models)

## Future Improvements

- Add support for multiple Claude models (Opus, Sonnet)
- Implement streaming responses for faster initial display
- Expand the integration to other areas of the application beyond negotiation strategies