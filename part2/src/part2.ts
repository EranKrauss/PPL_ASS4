/* 2.1 */

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}


export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    let map: Map<K,V> = new Map();

    return {
        get(key: K){
            let val = map.get(key);
            return (val ? Promise.resolve(val): Promise.reject(MISSING_KEY)); 
        },
        set(key: K, value: V) {
            map.set(key, value);
            return Promise.resolve()                
        },
        delete(key: K) {
            return map.delete(key) ? Promise.resolve() : Promise.reject(MISSING_KEY);
        },
    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<string | V[] | undefined[] | (V | undefined)[]>{    
    let valuesArr = keys.map((key) =>{ 
        let v: V | undefined;
        store.get(key).then(val => {v = val;}).catch(e => {v = undefined})
        return v;
        }
    )
    // let valuesArr2 = valuesArr.filter(v => v !== undefined)
    let check = valuesArr.every(v => v !== undefined)
    return check ? Promise.resolve(valuesArr) : Promise.reject(MISSING_KEY)

}

/* 2.2 */

// ??? (you may want to add helper functions here)
//
export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    let p: PromisedStore<T,R> = makePromisedStore<T,R>();
    return async (param: T )=> {
        let res = await f(param);
        p.set(param, res);
        return Promise.resolve(res)
    };
}

/* 2.3 */

// export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: ???): ??? {
//     ???
// }

// export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: ???): ??? {
//     ???
// }

/* 2.4 */
// you can use 'any' in this question

// export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...(???)[]]): Promise<any> {
//     ???
// }