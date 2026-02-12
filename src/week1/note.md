[todo]: move study note on model parameter such as temperature, top-p, frequency penalty and presence penalty here.

### Rules of thumb and examples for prompting

1. Use latest models
2. Put strategic instructions at the beginning of the prompt and use ### or """ to separate the instruction context

example:

```txt
Summarize the text below as a bullet point list of the most important points.

Text: """
{text input here}
"""
```

3. Be specific and description and detail enough

Bad:
```txt
Write a poem about OpenAI. 
```

Good:
```txt
Write a short inspiring poem about OpenAI, focusing on the recent DALL-E product launch (DALL-E is a text to image ML model) in the style of a {famous poet}
```

4. Articulate the desired output format through examples

5. Reduce “fluffy” and imprecise descriptions

bad:
```
The description for this product should be fairly short, a few sentences only, and not too much more.
```

good:
```
Use a 3 to 5 sentence paragraph to describe this product.
```

6. Instead of just saying what not to do, say what to do instead


Tokens
- Same prompt sent to different model can end up having two different tokens

Token passage

Input: "Hello World!"
split: [hello] [world] [!]
encode: [13225] [5922] [0]
LLM: Thinking..
output: [12194] [0]
decode: [hi] [!]
join: "hi!"
------

- Think of tokens and tokenization as the vocabulary used by the LLM
- Each LLM provider train their own vocabulary
- More tokens means small token size required by model. e.g a model with token size 50k would might transform input to a token length of 3, when a model with 200k would transform input to 2
- The larger the vocabulary (token size), the larger the model, and larger memory
- Unusual world are split to more token. So a prompt with words that are know would cost more tokens

Tokens are the currency of LLM's

[Source](https://www.youtube.com/watch?v=nKSk_TiR8YA)

tokenizer - tool that convert words into token

### Context Windows:

Context windows represents an AI models "Working memory"
ie how large of an information the AI can consider at once.

This includes prompt, the conversation history and generated response
e.g GPT-3.5 (16K), GPT-4 Turbo (128k), Claude (200k)

More context window, more ability to handle large input


### Strategies for long conversations

Periodic Summarization: Periodically ask the LLM to summarize the conversation, then reset or restart the chat with this summary to free up the context window.

Context Compaction/Trimming: Remove older messages or use "SlimContext" techniques to condense history while retaining essential facts, preventing the model from losing focus. Or consider the sliding window approach, to only keep the most recent messages

Explicit Prompting: Use clear instructions and constraints (e.g., "Keep your response under 200 words") to maintain focus and minimize misinterpretation in lengthy discussions.

Strategic Reinforcement: Reiterate the original goal or constraints at intervals to ensure the model stays on track, as attention tends to drift in long conversations.

Structured Data Input: For very long interactions, place long-form data at the top of the prompt, using XML tags to structure content and metadata, which helps the model find information.
```
XML Tags for Delineation: Using XML-style tags (<context>, <data>, <instruction>) is highly effective for structuring prompts. It provides clear boundaries that help the model separate instructions from data, reducing "contaminating" context
```

Relevant Attention (SRA): Use specific prompt templates that force the model to pay attention to strategy, or use a "cognitive context layer" that only injects facts relevant to the current query rather than the entire chat history.


