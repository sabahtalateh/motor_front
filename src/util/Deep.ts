function deep(value: any): any {
    if (typeof value !== 'object' || value === null) {
        return value
    }
    if (Array.isArray(value)) {
        return deepArray(value)
    }
    return deepObject(value)
}

function deepObject<T>(source: any) {
    const result: any = {}
    Object.keys(source).forEach(key => {
        const value = source[key]
        result[key] = deep(value)
    }, {})
    return result as T
}

function deepArray(collection: any[]) {
    return collection.map(value => {
        return deep(value)
    })
}

export { deep }
