import { createClient } from '@/lib/supabase/server'
import type { Message, MessageInsert } from '@/types'

export async function getMessagesForConversation(
  listingId: string,
  userId: string
): Promise<Message[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('listing_id', listingId)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch messages: ${error.message}`)
  return data ?? []
}

export async function sendMessage(message: MessageInsert): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('messages').insert(message)

  if (error) throw new Error(`Failed to send message: ${error.message}`)
}

export async function markAsRead(messageId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)

  if (error) throw new Error(`Failed to mark message as read: ${error.message}`)
}
