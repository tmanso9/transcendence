export interface User {
  username?: string
  id?: number
  points?: number
  wins?: number
  losses?: number
  position?: number
  avatar?: string
  fetchUser?: Function
  tfa_enabled?: boolean
}
