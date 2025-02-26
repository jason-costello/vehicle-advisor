# Vehicle Advisor

A web application to help users make informed decisions when purchasing a used vehicle by providing comprehensive analysis of vehicle data, safety ratings, recalls, market pricing, and AI-powered negotiation strategies.

## Features

- **VIN Decoding**: Retrieve detailed vehicle information from the VIN
- **Safety Analysis**: Check for recalls and view safety ratings
- **Market Analysis**: Compare prices with similar vehicles in your area
- **Claude AI-Powered Negotiation Strategies**: Get personalized negotiation advice

## Getting Started

### Prerequisites

- Node.js 18+ and npm or pnpm
- API keys for:
    - MarketCheck API (for vehicle data)
    - Claude API by Anthropic (for AI negotiation strategies)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vehicle-advisor.git
cd vehicle-advisor
```

2. Install dependencies:
```bash
npm install
# or 
pnpm install
```

3. Create a `.env` file based on `.env.example` and add your API keys:
```
VITE_MARKETCHECK_API_KEY=your_key_here
VITE_CLAUDE_API_KEY=your_key_here
# Add other required environment variables
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

## Using the Application

1. Enter the vehicle's VIN, your ZIP code, and the vehicle's mileage
2. View the decoded vehicle information
3. Check for recalls and safety ratings
4. Analyze the market price compared to similar vehicles
5. Get AI-generated negotiation strategies

## Technologies

- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [MarketCheck API](https://marketcheck.com/) - Vehicle data provider
- [NHTSA API](https://api.nhtsa.gov/) - Safety ratings and recalls
- [Claude API by Anthropic](https://anthropic.com/) - AI for negotiation strategies

## API Keys Setup

### Claude API Key
1. Sign up for an account at [Anthropic's Console](https://console.anthropic.com/)
2. Generate an API key
3. Add it to your `.env` file as `VITE_CLAUDE_API_KEY`

### MarketCheck API Key
1. Sign up for an account at [MarketCheck](https://marketcheck.com/)
2. Generate an API key
3. Add it to your `.env` file as `VITE_MARKETCHECK_API_KEY`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.