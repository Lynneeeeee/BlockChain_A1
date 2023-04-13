
const sha256 = require("crypto-js/sha256");

// for different input, even one word different
// sha256 will totoal changed 
console.log(sha256("Ying").toString()); //0cbca008c28e46c0d7ea3dd8bd82057f4b3cbefd956ac796c1c40043bb2c098a
console.log(sha256("ying").toString()); //ffb572c3cdd46c7d2a4dd79eda5d9836ad414d95fd54830c5088f6b43a50ad42


function proofOfWork(){
    let data = "ying";
    let x = 1;
    while(true) {
        // let the 1st digit of sha256 of string "ying1" = 0: around 1 sec
        // Change substring(0,4) to see the time it takes(fist 4 digit all = 0): more than 2 min
        // In blockchain, it forces the 72 first digit all = 0, which is very difficult to find
        // That's why miners need the best graphic cards to compute
        if (sha256(data + x).toString().substring(0, 1) !== "0") {
            x = x + 1;
          } else {
            console.log(sha256(data + x).toString());
            console.log(x);
            break;
          }
    }
}

proofOfWork();
// sha256 of "ying25": 0b0b686e1b25dd2caeb895c34f49cf3bf770c898197d5385e9bf541aa4f1ce4b
// when x = 25