class Iter<T> {
  constructor(private readonly iterable: Iterable<T>) {}

  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }

  take(n: number): Iter<T> {
    const iterator = this.iterable[Symbol.iterator]();
    let remainingCount = n;

    return new Iter({
      [Symbol.iterator](): IterableIterator<T> {
        return {
          [Symbol.iterator](): IterableIterator<T> { return this; },

          next(): IteratorResult<T> {
            if (remainingCount <= 0) {
              return { done: true, value: undefined }
            }
    
            remainingCount -= 1;
            return iterator.next();
          }
        }
      }
    });
  }

  takeWhile(predicate: (value: T) => boolean): Iter<T> {
    const iterator = this.iterable[Symbol.iterator]();
    let shouldTake = true;

    return new Iter({
      [Symbol.iterator](): IterableIterator<T> {
        return {
          [Symbol.iterator]() { return this; },

          next(): IteratorResult<T> {
            if (!shouldTake) {
              return { done: true, value: undefined };
            }

            const result = iterator.next();
            
            if (result.done || !predicate(result.value)) {
              shouldTake = false;
              return { done: true, value: undefined };
            }

            return result;
          }
        };
      }
    });
  }

  skip(n: number): Iter<T> {
    const iterator = this.iterable[Symbol.iterator]();
    let skipped = 0;

    return new Iter({
      [Symbol.iterator](): IterableIterator<T> {
        return {
          [Symbol.iterator](): IterableIterator<T> { return this; },

          next(): IteratorResult<T> {
            while (skipped < n) {
              iterator.next();
              skipped += 1;
            }

            return iterator.next();
          }
        }
      }
    });
  }

  skipWhile(predicate: (value: T) => boolean): Iter<T> {
    const iterator = this.iterable[Symbol.iterator]();
    let shouldSkip = true;

    return new Iter({
      [Symbol.iterator](): IterableIterator<T> {
        return {
          [Symbol.iterator]() { return this; },

          next(): IteratorResult<T> {
            while (shouldSkip) {
              const result = iterator.next();
              
              if (result.done) {
                return result;
              }

              if (!predicate(result.value)) {
                shouldSkip = false;
                return result;
              }
            }

            return iterator.next();
          }
        };
      }
    });
  }

  filter(predicate: (value: T) => boolean): Iter<T> {
    const iterator = this.iterable[Symbol.iterator]();

    return new Iter({
      [Symbol.iterator](): IterableIterator<T> {
        return {
          [Symbol.iterator]() { return this; },

          next(): IteratorResult<T> {
            while (true) {
              const result = iterator.next();

              if (result.done || predicate(result.value)) {
                return result;
              }
            }
          }
        }
      }
    });
  }

  map<MappedT>(mapper: (value: T) => MappedT): Iter<MappedT> {
    const iterator = this.iterable[Symbol.iterator]();

    return new Iter<MappedT>({
      [Symbol.iterator](): IterableIterator<MappedT> {
        return {
          [Symbol.iterator](): IterableIterator<MappedT> { return this; },

          next(): IteratorResult<MappedT> {
            // TODO Проверить, как себя поведет при value == null
            const { done, value } = iterator.next();

            return { done, value: mapper(value) }
          }
        }
      }
    });
  }

  enumerate(): Iter<[ number, T ]> {
    const iterator = this.iterable[Symbol.iterator]();
    let i = 0;

    return new Iter<[ number, T ]>({
      [Symbol.iterator](): IterableIterator<[ number, T ]> {
        return {
          [Symbol.iterator](): IterableIterator<[ number, T ]> { return this; },

          next(): IteratorResult<[ number, T ]> {
            const result = iterator.next();
            if (result.done) {
              return result;
            }

            return { done: false, value: [ i++, result.value ] }
          }
        }
      }
    });
  }

  find(predicate: (value: T) => boolean): T | undefined {
    const iterator = this.iterable[Symbol.iterator]();
    
    while (true) {
      const { done, value } = iterator.next();
      if (done) {
        return undefined;
      }
      if (predicate(value)) {
        return value;
      }
    }
  }
}

const items = new Array(1000).fill(null).map((_, i) => i);

const iter = new Iter(items)
  .skipWhile(el => el <= 10)
  .takeWhile(el => el <= 25)
  .skip(2)
  .take(4)
  .filter(el => el % 2 === 0)
  .map(el => `${el ** 2}`)
  .enumerate();

for (const element of iter) {
  console.log(element);
}
