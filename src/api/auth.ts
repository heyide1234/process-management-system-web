import api from './request'

export function login(username: string, password: string) {
  return api.post<{ token: string; username: string }>('/api/auth/login', {
    username,
    password
  })
}