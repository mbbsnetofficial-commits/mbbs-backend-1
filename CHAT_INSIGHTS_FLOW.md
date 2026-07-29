# Chat insights and Gemini model flow

## Endpoint

```http
POST /api/v1/chat-sessions/:chatSessionId/insights
Authorization: Bearer ACCESS_TOKEN
```

No request body is required.

## Processing flow

```text
Authenticate student
  -> confirm the student owns the active chat session
  -> load its completed test and wrong answers
  -> load the associated questions and explanations
  -> build a restricted NEET review context
  -> call the configured current Gemini model
  -> retry temporary provider failures
  -> rotate configured API keys
  -> try the supported fallback model when necessary
  -> calculate factual subject totals locally
  -> store the combined insight report
  -> return the report
```

Gemini supplies qualitative analysis such as weak concepts, mistake patterns,
revision checkpoints, and the motivational phrase. Scores, counts, accuracy,
and time totals are calculated by the backend from test data rather than
trusted to the model.

## Model configuration

The chat service uses the shared Gemini configuration:

```env
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
```

It can rotate `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, and
`GEMINI_API_KEY_3`. Retired `gemini-2.5-flash` configuration values are
normalized to the supported fallback, so an old deployment value cannot send
this endpoint back to the retired model.

Provider errors are not returned verbatim to clients. If all configured models
and keys fail, the endpoint returns HTTP `503` with a controlled retry message.
