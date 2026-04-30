# IELTS Process Writing Trainer

This is a dependency-free React demo project. It uses React from a browser CDN and a tiny local Node server, so it can run even when `npm` is unavailable.

## Run

```bash
node server.mjs
```

Then open:

```text
http://localhost:4173
```

## Notes

- Answers are editable controlled inputs.
- Scores persist in `localStorage`.
- Practice 2 supports both drag-and-drop and click-to-fill.
- The app is structured to avoid rebuilding large data objects during typing.
