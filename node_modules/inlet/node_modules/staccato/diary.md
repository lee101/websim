# Staccato Diary

## Concerns and Decisions

 * For now, let's always have the footer be a plain-old JavaScript object.
 * Opening a staccato can be from the first record or the footer.
 * You can seek into the staccato, then play forward from there.
 * Writing to the staccato appends, flushing writes the footer.

## When to Wait on Drain

Why wait on drain if you're not going to write again? It appears that the moment
you've gone over the high-water mark, you get the `false` return. Not on a
subsequent write. With Strata I'll be going over the high-water mark
immediately when I write a buffered page, so I'll be waiting until that page is
written, even if I'm off to a next page, or even if I have to build another
large buffer before the next write.

The wait until next time in the `over-clever` branch is the correct
implementation of Staccato.
