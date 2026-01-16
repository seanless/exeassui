import dayjs from 'dayjs';

const DateUtil = {
  DateFormat: "YYYY-MM-DD",
  DateTimeFullFormat: "YYYY-MM-DD HH:mm:ss",
  FullTimeFormat: "HH:mm:ss",
  ShortTimeFormat: "HH:mm",
  formatTime: function (timeLong) {
    if (timeLong < 60) {
      return timeLong + "分";
    }

    if (timeLong < 1440) {
      return (timeLong / 60.0).toFixed(1) + "小时";
    }

    return (timeLong / 1440).toFixed(1) + "天";
  },
  getTodayStart: function () {
    return dayjs().startOf('date').format(this.DateTimeFullFormat)
  },
  getNow: function () {
    return dayjs().format(this.DateTimeFullFormat)
  },
  formatRangeTime: function (range) {
    var startTime = this.getTodayStart();
    console.log("the start time is:", startTime);
    var endTime = this.getNow();
    if (range) {
      var tmp1 = range[0];
      var tmp2 = range[1];
      startTime = tmp1.format(this.DateTimeFullFormat);
      endTime = tmp2.format(this.DateTimeFullFormat);
    }

    return { startTime: startTime, endTime: endTime };
  },

  formatDateTime: function (value) {
    if (!value) return "";

    const date = new Date(value);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }
};

export { DateUtil }