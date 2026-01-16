import http from './http';
let globalThemeConfig=null;
const DynamicCss={
  getThemeConfig:()=>{
    if(globalThemeConfig){
      return globalThemeConfig;
    }

    http.getSync("/user/theme").then((result=>{
      globalThemeConfig=result.data;
      return globalThemeConfig;
    }))
  },

  getUserCardCss:function(user){
    let bgColor="#E9E4CE";
    let fontColor="#000000";
    var tmpTheme=this.getThemeConfig();
    if(!tmpTheme){
      return {
        backgroundColor:bgColor,
        border: "1px solid "+bgColor,
        color:fontColor
      }
    }

    switch(user.workState){
      case 301:
        bgColor=tmpTheme.backgroundWorkFree;
        fontColor=tmpTheme.fontColorWorkFree;
        break;
      case 302:
        bgColor=tmpTheme.backgroundWorkBusy;
        fontColor=tmpTheme.fontColorWorkBusy;
        break;
      case 303:
        bgColor=tmpTheme.backgroundWorkToClock;
        fontColor=tmpTheme.fontColorWorkToClock;
        break;
      case 304:
        bgColor=tmpTheme.backgroundWorkTimeout;
        fontColor=tmpTheme.fontColorWorkTimeout;
        break;
      case 311:
        bgColor=tmpTheme.backgroundWorkPreOn;
        fontColor=tmpTheme.fontColorWorkPreOn;
        break;
      case 312:
        bgColor=tmpTheme.backgroundWorkLateOff;
        fontColor=tmpTheme.fontColorWorkLateOff;
        break;
      case 321:
        bgColor=tmpTheme.backgroundWorkBooking;
        fontColor=tmpTheme.fontColorWorkBooking;
        break;
      case 322:
        bgColor=tmpTheme.backgroundWorkFree;
        fontColor=tmpTheme.fontColorWorkFree;
        break;
      case 323:
        bgColor=tmpTheme.backgroundWorkToOn;
        fontColor=tmpTheme.fontColorWorkToOn;
        break;
      case 324:
        bgColor=tmpTheme.backgroundWorkOff;
        fontColor=tmpTheme.backgroundWorkOff;
        break;
      default:
        bgColor="#E9E4CE";
        break;
    }

    // switch(user.workState){
    //   case 301:
    //     bgColor="#E9E4CE";
    //     break;
    //   case 302:
    //     bgColor="#0092D8";
    //     fontColor="white";
        
    //     if(user.clockType==260){
          
    //       bgColor="#4682B4";
    //       fontColor="white";
    //     }
    //     break;
    //   case 303:
    //     bgColor="#0092D8";
    //     fontColor="red";
    //     break;
    //   case 304:
    //     bgColor="#0092D8";
    //     fontColor="red";
    //     break;
    //   case 311:
    //     bgColor="#2ec770";
    //     break;
    //   case 312:
    //     bgColor="#2ec770";
    //     break;
    //   case 321:
    //     bgColor="#EF6D53";
    //     break;
    //   case 322:
    //     bgColor="#F4A460";
    //     break;
    //   case 323:
    //     bgColor="#bdb7bc";
    //     break;
    //   case 324:
    //     bgColor="#bdb7bc";
    //     break;
    //   default:
    //     bgColor="#E9E4CE";
    //     break;
    // }

    return {
      backgroundColor:bgColor,
      border: "1px solid "+bgColor,
      color:fontColor
    }
  }
};

export default DynamicCss