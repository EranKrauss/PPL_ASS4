/* 2.1 */

export const MISSING_KEY = "___MISSING___";

type PromisedStore<K, V> = {
    get(key: K): Promise<V>;
    set(key: K, value: V): Promise<void>;
    delete(key: K): Promise<void>;
};

export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    let map: Map<K, V> = new Map();

    return {
        get(key: K) {
            let val = map.get(key);
            return val ? Promise.resolve(val) : Promise.reject(MISSING_KEY);
        },
        set(key: K, value: V) {
            map.set(key, value);
            return Promise.resolve();
        },
        delete(key: K) {
            return map.delete(key) ? Promise.resolve() : Promise.reject(MISSING_KEY);
        },
    };
}

export function getAll<K, V>(
    store: PromisedStore<K, V>,
    keys: K[]
): Promise<string | V[] | undefined[] | (V | undefined)[]> {
    let valuesArr: (V | undefined)[] = []
    keys.map((key) => {
        //let v: V | undefined;
        store
            .get(key)
            .then((val) => {
                valuesArr.push(val)
            })
            .catch((e) => {
                valuesArr.push(undefined)
            });
    });
    let check = valuesArr.every((v) => v !== undefined);
    return check ? Promise.resolve(valuesArr) : Promise.reject(MISSING_KEY);
}

/* 2.2 */

// ??? (you may want to add helper functions here)
//
export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    let p: PromisedStore<T, R> = makePromisedStore<T, R>();
    let func: (x: T) => Promise<R> = async (param: T) => {
        let res = await f(param);
        await p.get(param).catch(e => {p.set(param, res);})
        return  p.get(param);
    };
    return func;
}

/* 2.3 */

export function lazyFilter<T>(
    genFn: () => Generator<T>,
    filterFn: (item: T) => boolean
): () => Generator<T> {
    return (): Generator<T> => generator_helper_filter(genFn(), filterFn);
}

function* generator_helper_filter<T>(
    genFn: Generator<T>,
    filterFn: (item: T) => boolean
): Generator<T> {
    let curr = genFn.next();
    while (!curr.done) {
        if (filterFn(curr.value)) yield curr.value;
        curr = genFn.next();
    }
}

export function lazyMap<T, R>(
    genFn: () => Generator<T>,
    mapFn: (item: T) => R
): () => Generator<R> {
    return (): Generator<R> => generator_helper_map(genFn(), mapFn);
}

function* generator_helper_map<T, R>(
    genFn: Generator<T>,
    mapFn: (item: T) => R
): Generator<R> {
    let curr = genFn.next();
    while (!curr.done) {
        yield mapFn(curr.value);
        curr = genFn.next();
    }
}

/* 2.4 */
// you can use 'any' in this question


//        const v = await asyncWaterfallWithRetry([async () => 1, async v => v + 1, async v => v * 2 ])
 





export async function asyncWaterfallWithRetry(
    fns: [() => Promise<any>, ...((item: any) => Promise<any>)[]]
): Promise<any> {
    return fns[0]()
        .then((x) => {
            asyncWaterfallWithRetry_helper(fns.slice(1), x);
        })
        .catch((e) => {
            setTimeout(() => {
                fns[0]()
                    .then((x) => asyncWaterfallWithRetry_helper(fns.slice(1), x))
                    .catch((e) => {
                        setTimeout(() => {
                            fns[0]()
                                .then((x) => asyncWaterfallWithRetry_helper(fns.slice(1), x))
                                .catch((e) => Promise.reject(e));
                        }, 2000);
                    });
            }, 2000);
        });
}

//        const v = await asyncWaterfallWithRetry([async v => v + 1, async v => v * 2 ])

async function asyncWaterfallWithRetry_helper(
    fns: ((item: any) => Promise<any>)[],
    val: any
): Promise<any> {
    if (fns.length == 1) {
        return await fns[0](val);
    }

    return await fns[0](val)
        .then((x) => asyncWaterfallWithRetry_helper(fns.slice(1), x))
        .catch((e) => {
            setTimeout(() => {
                fns[0](val)
                    .then((x) => asyncWaterfallWithRetry_helper(fns.slice(1), x))
                    .catch((e) => {
                        setTimeout(() => {
                            fns[0](val)
                                .then((x) => asyncWaterfallWithRetry_helper(fns.slice(1), x))
                                .catch((e) => Promise.reject(e));
                        }, 2000);
                    });
            }, 2000);
        });
}
