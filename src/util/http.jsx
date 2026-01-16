import axios from "axios";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { message, Spin } from "antd";
import "../asset/css/main.css";

axios.defaults.timeout = 100000;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true


// 当前正在请求的数量
let requestCount = 0

// 显示loading
export function showLoading() {
  if (requestCount === 0) {

    var wrapper = document.createElement("div")
    wrapper.setAttribute("id", "datanetloading")
    document.body.appendChild(wrapper)
    var rootLoading = createRoot(wrapper);
    rootLoading.render(<Spin style={{position:"absolute", display:"flex",justifyContent:"center", alignItems:"center", top:"0",left:"0", textAlign: "center", height: "100%", width: "100%" }} tip="加载中..." size="large" />)
  }
  requestCount++
}

// 隐藏loading
function hideLoading() {
  requestCount--
  if (requestCount === 0) {
    document.body.removeChild(document.getElementById('datanetloading'))
  }
}

let http = {
  get: function (url, params, isBackground,customBase="apiHost") {
    params = params || {};
    let p = new Promise((resolve, reject) => {
      axios.get(`${window['env'][customBase]}${url}`,
        {
          params: params,
          isLoading: !isBackground
        })
        .then((res) => {
          resolve(res.data);
        }).catch((error) => {
          reject(error);
        });
    });
    return p;
  },

  getSync: async function (url, params,customBase="apiHost") {
    params = params || {}
    var res = await axios.get(`${window['env'][customBase]}${url}`, {
      params: params
    });
    return res.data;
  },
  /** post 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  post: function (url, params,customBase="apiHost") {
    params = params || {};
    return new Promise((resolve, reject) => {
      axios.post(`${window['env'][customBase]}${url}`, params)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  export: function (url, params, filename,customBase="apiHost") {
    params = params || {};
    axios.post(`${window['env'][customBase]}${url}`, params, { responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data]);
        const elink = document.createElement('a');
        elink.download = filename;
        elink.style.display = 'none';
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        if (href) {
          URL.revokeObjectURL(href);
        }

        document.body.removeChild(elink);
      })
      .catch(err => {
        console.log(err);
        // throw new Error(err);
      });
  }
}


// 请求前拦截
axios.interceptors.request.use(
  config => {
    let token = localStorage.getItem("access_token");
    if (token == undefined || token == null) {
      token = "";
    }

    config.headers['Authorization'] = token;

    if (config.isLoading !== false) {
      // showLoading()
    }
    return config
  },
  err => {
    if (err.config.isLoading !== false) {
      hideLoading()
    }
    message.error("请求超时");
    return Promise.reject(err);
  }
);

//   // 返回后拦截
axios.interceptors.response.use(res => {
  if (res.config && res.config.isLoading !== false) {
    hideLoading()
  }
  return res
},
  err => {
    if (err.config && err.config.isLoading !== false) {
      hideLoading()
    }
    if (err.message === 'Network Error') {
      message.warning('网络连接异常！')
      return;
    }
    if (err.code === 'ECONNABORTED') {
      message.warning('请求超时，请重试')
      return;
    }
    // if (err.response && err.response.status === 401) {
    //   message.error("登陆超时，请先登陆", 3);
    //   window.location.href = '/datanetui/login';
    //   return;
    // }

    return Promise.reject(err);
  }
);

export default http