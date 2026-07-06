# Sprint 4 Part 2 - TODO

## Remaining tasks
- [x] TASK 1: Implement `calculatePortfolioRisk()` in `utils/portfolioMetrics.ts`

- [ ] TASK 2: Rewrite `components/dashboard/PortfolioRiskCard.tsx` to use `usePortfolioData()` + `calculatePortfolioRisk()` and remove placeholders (`--` when unavailable)

- [ ] TASK 3: Rewrite `components/dashboard/PortfolioAllocationChart.tsx` to remove 72/28 fallback; show empty state when allocation unavailable
- [ ] TASK 4: Rewrite `components/dashboard/PortfolioPerformanceCard.tsx` to remove generated/demo history; show "Portfolio History Unavailable" when history cannot be reconstructed
- [ ] TASK 5: Rewrite `components/dashboard/AIPortfolioAdvisor.tsx` to consume `usePortfolioData()` directly; no placeholder props
- [ ] TASK 6: Remove ALL placeholder numbers/strings across repo: `24580`, `1245`, `72/28`, `72`, `5.3`, `12 holdings`, `demo`, `placeholder`, `generated history`, `Fake trend`
- [ ] TASK 7: Ensure all portfolio components derive from SAME enriched portfolio object (no duplicate fetches; no duplicate calculations): TerminalMetricCards, PortfolioPanel, charts/cards, AI advisor
- [ ] TASK 8: Run `npm run lint` (0 ESLint errors) and `npm run build` (successful Next.js production build)


