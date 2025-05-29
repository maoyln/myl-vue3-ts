import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use(config => {
  // 可添加 token 等逻辑
  return config
})

request.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default request
