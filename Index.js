const c = new CacheSimulator();

const tokens = inputText.split(/\s+/);

for (let i = 0; i < tokens.length; i++){
    const token = tokens[i];
    switch(token){
        case "R":{
            console.log(`->Read address x${tokens[i+1]}`)
            c.readByte(parseInt(tokens[i + 1], 16))
            i++;
            break;
        }
        case "W": {
            console.log(`->Write to address x${tokens[i+1]} data x${tokens[i+2]}`);
            c.writeByte(parseInt(tokens[i + 1], 16), parseInt(tokens[i + 2], 16));
            i += 2;
            break;
        }
        case "D":{
            console.log('->Display the cache')
            c.displayCache();
        }
    }
}