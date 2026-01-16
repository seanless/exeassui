let MathUtil = {
  roundFun: function(value,n){
    return Math.round(value*Math.pow(10,n))/Math.pow(10,n);
  },
  pad:function(num, n){
    var len = num.toString().length;
    while(len < n) {
      num = "0" + num;
      len++;
    }
    return num;
  }
}


  
export default MathUtil