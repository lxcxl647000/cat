import { sys } from 'cc';
import { qc } from '../../qc';
const dataID: string = 'xxl'
type dataType = number | string | boolean

export class LocalStorage {
    getKey(key: string): string {
        return `${dataID}_${qc.platform.platformTag()}_${key}`
    }

    setItem(key: string, value: dataType): void {
        if (typeof value === "boolean") value = Number(value)
        const keyStr: string = this.getKey(key)
        sys.localStorage.setItem(keyStr, String(value))
    }

    getItem(key: string, defVal?: dataType): any {
        const keyStr: string = this.getKey(key)
        let value: string = sys.localStorage.getItem(keyStr)
        if (value) return value
        return defVal
    }

    getObj(key: string, defVal?: Object | any[]): any {
        const keyStr: string = this.getKey(key)
        let str: string = sys.localStorage.getItem(keyStr)
        if (str) return JSON.parse(str)
        return defVal
    }

    setObj(key: string, obj: Object | any[], log: boolean = true): void {
        let str: string = JSON.stringify(obj)
        const keyStr: string = this.getKey(key)
        sys.localStorage.setItem(keyStr, str)
    }

    clear(): void {
        sys.localStorage.clear()
    }

    removeItem(key: string): void {
        const keyStr: string = this.getKey(key)
        sys.localStorage.removeItem(keyStr)
    }
}