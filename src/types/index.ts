import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  name: string
  password: string
  createdAt: Date
}

export interface VideoMetaKV {
  key: string
  value: string
}

export interface Video {
  _id?: ObjectId
  userId: ObjectId
  name: string
  description: string
  tags: string[]
  metadata: VideoMetaKV[]
  size: number
  key: string
  contentType: string
  createdAt: Date
  updatedAt: Date
}

export interface JwtPayload {
  userId: string
  email: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}
