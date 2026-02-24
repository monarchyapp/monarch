# Monarch

Monarch is a financial intelligence layer for Solana wallets.

It transforms raw on-chain activity into structured portfolio analytics — enabling clear visibility into performance, capital flows, asset exposure, and risk over time.

---

## The Problem

Block explorers show transactions.

Portfolio trackers show balances.

Neither shows structure.

A wallet is a financial system — composed of positions, cost basis, realized gains, unrealized exposure, inflows, outflows, and capital allocation decisions.

Monarch is built to model that system.

---

## What Monarch Does

- Aggregates wallet positions across SPL assets
- Tracks historical cost basis and PnL
- Breaks down capital inflows and outflows
- Visualizes asset allocation over time
- Models portfolio performance structurally
- Surfaces financial clarity from raw blockchain data

Monarch is not a transaction feed.

It is a structured financial dashboard.

---

## Design Principles

- Precision over noise
- Structure over speculation
- Performance over gimmicks
- Data over hype

Monarch is built for operators who treat their wallet like capital.

---

## Architecture

Monarch combines:

- A high-performance React + TypeScript frontend
- Structured financial modeling logic
- Supabase (database + edge functions)
- Real-time Solana RPC integrations
- Deterministic portfolio computation

The focus is accuracy, clarity, and system-level visibility.

---

## Development

Install dependencies:

```bash
npm install
