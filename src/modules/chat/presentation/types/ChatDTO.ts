export interface ChatMessageDTO {
  id: number
  booking_id: number
  sender_id: number
  message: string
  sent_at: string
  is_read: boolean
  read_at: string | null
}

export interface ChatConversationResponseDTO {
  booking_id: number
  messages: ChatMessageDTO[]
  total_messages: number
  unread_count: number
}

export interface SendMessageRequestDTO {
  message: string
}
