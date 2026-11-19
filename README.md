# Water Intake Tracker

Ripple is a small, responsive, local-first app for recording drinks and reviewing a seven-day history. No account or network connection is required.

## Features

- Choose quick-add amounts or log a custom amount.
- Set a personal daily goal (1–10,000 ml).
- Undo the latest entry or clear today's log.
- Review logged totals for the previous seven calendar days.
- Keep all logs in the current browser.

## Run locally

Open `index.html` in a current browser. For local development, run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Test

Requires Node.js 18 or newer; there are no npm dependencies.

```sh
npm test
npm run check
```

## Privacy and limitations

Data is stored only in this browser's `localStorage`. This is a logging tool, not a medical recommendation; hydration needs vary.

## License

MIT. See [LICENSE](./LICENSE).
