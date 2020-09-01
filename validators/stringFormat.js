//Remove extra white space from the string.
const removeExtraWhiteSpace = (str) =>{
    str = str.trim();
    let targetStr="";
    let cnt=0;
    for(let ch of str){
        if(ch==' '){
            cnt++;
            if(cnt==1){
                targetStr+=' ';
            }
        }else{
            cnt=0;
            targetStr+=ch;
        }
    }
    return targetStr;
}

module.exports ={
    removeExtraWhiteSpace
}