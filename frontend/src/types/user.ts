export interface User {
  username?: string
  id?: string
  points?: number
  wins?: number
  losses?: number
  position?: number
  avatar?: string
  fetchUser?: Function
}
