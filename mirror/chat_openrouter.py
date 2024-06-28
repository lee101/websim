import traceback

import openai
from loguru import logger

from netwrck.extrautils.cache import cache
from netwrck.nlp_utils import replace_bad_words
from netwrck.utils import log_time
from sellerinfo import OPENROUTER_API_KEY

openai.api_key = OPENROUTER_API_KEY
openai.api_base = "https://openrouter.ai/api/v1"
def chat_gpt_old(prompt, context, pairs, greeting,
                 # model="lizpreciatior/lzlv-70b-fp16-hf"
                 model="neversleep/llama-3-lumimaid-8b"
                 # model="sao10k/l3-euryale-70b"
                 ):
    try:
        with log_time("openrouter"):
            logger.info(f"openrouter prompt: {prompt}")
            # replace context with safe words
            safecontext, context_replaced_map = replace_bad_words(prompt, True)
            if context_replaced_map:
                prompt = f"intimate erotic {prompt}"
            context = f"intimate erotic {context}"
            unsafe = oai_query_internal(
                prompt, pairs, None, system_message=context, greeting=greeting, model=model
            )

            logger.info(f"openrouter generated: {unsafe}")

        return unsafe
    except Exception as e:
        logger.error(e)
        traceback.print_exc()
        return ""


def pairs_to_openai(pairs):
    """return user, assistant alternating pairs"""
    pair_formatted = [
        (
            {"role": "user", "content": pair.input_text},
            {"role": "assistant", "content": pair.output_text},
        )
        for pair in pairs
    ]
    return [item for sublist in pair_formatted for item in sublist]


def cull_messages_over_max_tokens(pairs, max_tokens=8000):
    """remove messages until the total tokens is less than max_tokens

    its acutally doing character counting for now
    """
    total_used = 0
    for pair in pairs:
        pair_length = len(pair.input_text) + len(pair.output_text)
        total_used += pair_length
    if total_used < max_tokens:
        return pairs

    new_pairs = []
    for pair in pairs:
        pair_length = len(pair.input_text) + len(pair.output_text)
        total_used -= pair_length
        if total_used < max_tokens:
            new_pairs.append(pair)
    return new_pairs


@cache.memoize(typed=True, expire=60)
def oai_query_internal(
    query,
    pairs=None,
    stop_sequences: frozenset = None,
    system_message: str = None,
    greeting: str = None,
    retries=2,
    # model = "lizpreciatior/lzlv-70b-fp16-hf",
    model = "neversleep/llama-3-lumimaid-8b", # 0.225 pm token in/out
):
    if stop_sequences is None:
        stop_sequences = ["\n", "<|eot_id|>", "<|"]
    with log_time("openrouter query"):
        logger.info(f"Querying openrouter with query: {query}")
        messages = []
        if greeting:
            messages.append({"role": "assistant", "content": greeting})
        if pairs:
            pairs = cull_messages_over_max_tokens(pairs)
            messages.extend(pairs_to_openai(pairs))
        messages.append(
            # the system message isn't needed so save tokens by not sending it.
            # {"role": "system", "content": "You are a pandas plotly data scientist, type what comes next"},
            {"role": "user", "content": query},
        )
        if system_message:
            messages.insert(0, {"role": "system", "content": system_message})
        err = False
        response = None
        try:  # iteratively remove messages?
            if retries == 0:
                logger.info(f"fallback to faster model")
                model = "gryphe/mythomax-l2-13b" # or hermes?
            response = openai.ChatCompletion.create(
                extra_headers={
                    "HTTP-Referer": "Netwrck",  # Optional, for including your app on openrouter.ai rankings.
                    "X-Title": "Netwrck"  # Optional. Shows in rankings on openrouter.ai.
                },
                # model = "mistralai/mixtral-8x7b-instruct",
                # model = "microsoft/wizardlm-2-8x22b", #.65 pm
                # model = "microsoft/wizardlm-2-8x22b:nitro", # 1pm
                # model = "lizpreciatior/lzlv-70b-fp16-hf", # $0.7/M input tkns $0.9/M output tkns
                # todo fallback to other models when not paying
                # model = "gryphe/mythomax-l2-13b", # wrks $0.18/M input tkns $0.18/M output tkns
                # model = "austism/chronos-hermes-13b", # same as gryphe
                model = model, # same as gryphe
                messages=messages,
                temperature=0,
                max_tokens=256,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                timeout=7,
                stop=list(stop_sequences),
            )
        except Exception as e:
            logger.error(e)
            err = True
        if not response or not response.choices:
            err = True
        # retry once
        if err and retries > 0:
            if pairs:
                # only take into account the final pair - todo more to cut down the amount of data/tokens sent
                pairs = pairs[-1]
            return oai_query_internal(
                query, pairs, stop_sequences, system_message, greeting, retries - 1, model
            )

    if not response or not response.choices:
        logger.error(response)
        raise Exception("No response from OpenAI")
    # output = response.choices[0].text.strip()
    output = response["choices"][0]["message"]["content"]
    if not output:
        raise Exception("No response from OpenAI")
    if output.endswith("<|eot_id|>"):
        output = output[:-10]
    logger.info(f"OpenAI Generated text: {output}")
    return output
