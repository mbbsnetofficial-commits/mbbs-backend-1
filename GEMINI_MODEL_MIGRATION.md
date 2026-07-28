# Gemini model migration

The AI endpoints, including SEO generation, now use:

- Primary: `gemini-3.6-flash`
- Fallback: `gemini-3.5-flash-lite`

`gemini-2.5-flash` is no longer used. The backend also maps an old deployed
`gemini-2.5-flash` environment value to `gemini-3.5-flash-lite`, preventing the
retired value from continuing to break requests after this release.

## Deployment environment

Set:

```env
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
```

Keep `GEMINI_API_KEY` unchanged. Remove `GEMINI_TEMPERATURE`; newer Gemini
models deprecate that sampling parameter and the backend no longer sends it.

After updating the environment, redeploy the backend and retry the SEO endpoint.
The existing primary/fallback API-key rotation remains unchanged.
