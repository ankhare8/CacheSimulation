class CacheData {
    constructor(){
        this.value = new Array(16).fill(0);
        this.dirtyBit = false;
        this.validBit = false;
        this.tag = 0;
    }

    getDirtyBit(){
        return this.dirtyBit === false ? 0 : 1
    }

    getValidBit(){
        return this.validBit === false ? 0 : 1
    }

    getValue(){
        return this.value;
    }

    getTag(){
        return this.tag;
    }

    /***@param {boolean} input */
    setDirtyBit(input){
        if (typeof input == "boolean") {
            this.dirtyBit = input
        } else {
            throw new Error('Type Error')
        } 
    }

    /***@param {boolean} input */
    setValidBit(input){
        if (typeof input == "boolean") {
            this.validBit = input
        } else {
            throw new Error('Type Error')
        } 
    }

    setValue(value){
        this.value = value
    }

    setTag(tag){
        this.tag = tag;
    }
}