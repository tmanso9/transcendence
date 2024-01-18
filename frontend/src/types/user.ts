export interface User {
  username?: string
  id?: string
  points?: number
  gamestats?: {
	points: number,
	wins: number,
	losses: number
  }
  position?: number
  avatar?: string
  fetchUser?: Function
  tfa_enabled?: boolean
}
