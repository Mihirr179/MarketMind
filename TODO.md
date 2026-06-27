# TODO - MarketMind TradingView-like Search Upgrade

- [x] Implement SearchAutocomplete reusable component (premium dark TradingView-like UI)

- [ ] Add search universe catalog (Nifty 50, Nifty Next 50, major US, ETFs, BTC/ETH) with logos when available
- [ ] Add backend API endpoint `/api/search-autocomplete` for intelligent matching (name partial, symbol, case-insensitive)
- [x] Replace exact-match search in `TerminalTopNav` with autocomplete dropdown

- [x] Add debounce (300ms), caching, loading spinner, empty state (no alert)

- [ ] Add keyboard navigation (ArrowUp/ArrowDown/Enter)
- [ ] On selection, load chart + market data + AI analysis by driving `ChartStateContext` symbol
- [ ] Sync Dashboard render: `AiResearchCard` should receive selected symbol; `MarketOverviewContainer` should query selected symbol
- [ ] Summarize all modified files

