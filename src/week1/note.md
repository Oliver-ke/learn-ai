
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