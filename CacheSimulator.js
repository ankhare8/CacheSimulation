
/**
 * Assumptions: A 32-bit address, a 16 bit block size, and 16 bit slot size
*/
class CacheSimulator {
    #mainMemoryArr;
    #cacheArr;

    //Block Offset Bitmask
    static BOBM = 0x0000000F;

    //Slot Number Bitmask
    static SNBM = 0x000000F0;

    //Block Begins Bitmask
    static BBABM =  0xFFFFFFF0;

    //Block Offset Size
    static BOSize = 16;


    constructor(){
        this.#mainMemoryArr = new Int16Array(2048);
        this.#cacheArr  = []
        this.#mainMemoryInit();
        this.#cacheInit();
    }

    #mainMemoryInit(){
        let currValue = 0;

        for (let i = 0; i < this.#mainMemoryArr.length; i++){

            this.#mainMemoryArr[i] = currValue;

            if(currValue !== 0xFF){
                currValue++
            } else {
                currValue = 0
            }

            // console.log(this.#mainMemoryArr[i].toString(16))
        }
    }

    #cacheInit(){
        for (let i = 0; i < 16; i++){

            this.#cacheArr[i] = new CacheData();
        }
    }

    #getTag(inputByte){
        return inputByte >>> 8;
    }
    
    
    #getSlotNum(inputByte){
        const slotnum = (inputByte & CacheSimulator.SNBM) >>> 4;
        return slotnum
    }

    #getBlockOffset(inputByte){
        return (inputByte & CacheSimulator.BOBM);
    }


    /**
     * 
     * @param {Number} inputtedAddress 
     * @param {Number} slotNum 
     * @returns {boolean}
     */
    #checkForCacheHit(inputtedAddress, slotNum){
        //check cache at slot number
        const cachedItem = this.#cacheArr[slotNum]
            //check if validBit != 1
            if(cachedItem.getValidBit() != 1){
                this.#bringBlockIntoCache(inputtedAddress, slotNum);
                return false;
            }

            //get tag number for input
            const inputtedItemTag = this.#getTag(inputtedAddress)
            

            //check if input tag != cached tag to find out you need to overwrite the existing item in the cache
            if(inputtedItemTag != cachedItem.tag){

                //if the current item in the cache has had changes made to it, update MM before removing it
                if (cachedItem.getDirtyBit() === 1){
                    this.#writeBackUpdate(slotNum);
                }

                //bring the new block into the cache
                this.#bringBlockIntoCache(inputtedAddress, slotNum);
                return false;
            }

        return true
    }

    /**
     * 
     * @param {Number} inputtedAddress 
     * @param {Number} slotNum 
     * @returns {boolean}
     */
    #readCache(inputtedAddress, slotNum){
        //get block offset value
        const BO = this.#getBlockOffset(inputtedAddress)
        // console.log(BO);

        return this.#cacheArr[slotNum].value[BO]
    }

    /**
     * 
     * @param {Number} inputtedAddress 
     * @param {Number} slotNum 
     * @param {Number} newValue 
     */
    #writeCache(inputtedAddress, slotNum, newValue){
        //get block offset value
        const BO = this.#getBlockOffset(inputtedAddress)

        this.#cacheArr[slotNum].value[BO] = newValue
        this.#cacheArr[slotNum].setDirtyBit(true);

        return this.#cacheArr[slotNum].value[BO]
    }

    /**
     * 
     * @param {Number} slotNum 
     */
    #writeBackUpdate(slotNum){

        const fullTag = this.#cacheArr[slotNum].tag << 8;
        const fullSlot = slotNum << 4;
        //find block's first address
        const firstAddress =  fullSlot + fullTag

        //for the size of the block offset
        for(let i = 0; i < CacheSimulator.BOSize; i++){

            //process value in cache[slotNum] to be updated in mm
            // const completeData = this.#cacheArr[slotNum].value[i] + fullTag
            const completeData = this.#cacheArr[slotNum].value[i];
            
            //update the value in main memory
            this.#mainMemoryArr[firstAddress  + i] = completeData;
        }

        this.#cacheArr[slotNum].setValidBit(false)
        this.#cacheArr[slotNum].setDirtyBit(false)
    }

    /**
     * 
     * @param {Number} inputByte 
     * @param {Number} slotNum 
     */
    #bringBlockIntoCache(inputByte, slotNum){
        //find block's first address
        const firstAddress = (inputByte & CacheSimulator.BBABM)

        const tag = this.#getTag(inputByte)

        // console.log('input byte: ' + inputByte.toString(2))

        // console.log('first address: ' + firstAddress.toString(2));

        // console.log('slot num: ' + slotNum);

        this.#cacheArr[slotNum].setTag(tag);
        
        this.#cacheArr[slotNum].setValidBit(true);

        //for the size of the block offset
        for(let i = 0; i < CacheSimulator.BOSize; i++){

            //process value in mm[first address + i] to be stored in cache
            // const BOvalue = (this.#mainMemoryArr[firstAddress  + i] & CacheSimulator.BOBM);
            const BOvalue = (this.#mainMemoryArr[firstAddress  + i]);
            
            
            //cache[slotNum].value[i] = mmData
            this.#cacheArr[slotNum].value[i]= BOvalue
        }
            
    }

    /**
     * 
     * @param {Number} addressToRead 
     */
    readByte(addressToRead){
        const slotNum = this.#getSlotNum(addressToRead);
 
        let cacheResult; 

        this.#checkForCacheHit(addressToRead, slotNum) ? cacheResult = 'Cache Hit' : cacheResult = 'Cache Miss';

        const value = (this.#readCache(addressToRead, slotNum)).toString(16);
        const address = addressToRead.toString(16);

        console.log(`At byte x${address} there is value x${value} (${cacheResult})\n`);

    }

    
    /**
     * 
     * @param {*} addressToWrite 
     * @param {*} newValue 
     */
    writeByte(addressToWrite, newValue){
        // console.log(addressToWrite,  newValue);
        const slotNum = this.#getSlotNum(addressToWrite);

        let cacheResult; 

        this.#checkForCacheHit(addressToWrite, slotNum) ? cacheResult = 'Cache Hit' : cacheResult = 'Cache Miss';

        const value = (this.#writeCache(addressToWrite, slotNum, newValue)).toString(16);

        const address = addressToWrite.toString(16);

        console.log(`Value x${value} has been written to address x${address} (${cacheResult})\n`);
    }

    displayCache(){
        const space = "      "
        
        console.log("Slot Valid   Tag   Dirty    Data");
        
        for (let i = 0; i < this.#cacheArr.length; i++) {

            const currSlot = i.toString(16).toUpperCase();

            const data = this.#cacheArr[i].value.map(num => num.toString(16).toUpperCase().padStart(2, '0')).join(' ')
            const validBit = this.#cacheArr[i].getValidBit()
            const tag = this.#cacheArr[i].tag;
            const dirtyBit = this.#cacheArr[i].getDirtyBit()

            console.log(currSlot + space + validBit + space + tag + space + dirtyBit + space + data)
        }
        console.log("\n");
    }
}