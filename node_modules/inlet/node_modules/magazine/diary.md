# Magazine Diary

Notes on Magazine.

## Per Magazine Purge or Destroy

Two ways. One is to keep a second linked list that is a list of all of the
cartridges held by the magazine or, alternatively, simply a hash. As long as
we're linking, it might as well be a linked list though. Then to destroy the
magazine you keep calling remove on the head.

Alternatively, you could mark the magazine as defunct, then on purge you can
walk the entire linked list and remove any cartridges with a magazine that is
marked as defunct.

But, if we're walking anyway, we could walk the entire cache when we call purge,
looking for cartridges with the same magazine as this magazine and calling
remove on their keys.

## Expiration

You can simply implement expiration by stopping a purge, stopping the walk
backward through the list, when you reach an entry that has not yet expired. You
make progress by moving that entry to the head of the list, so that if there are
entries that have indeed expired, they can found at the head of the list.

Also, couldn't magazine manage an access timestamp for you?
