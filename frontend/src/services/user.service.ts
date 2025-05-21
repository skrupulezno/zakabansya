import api from '@/api/http'

export async function fetchUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function inviteUsers(boardId: number, userIds: number[]) {
  await api.post(`/boards/${boardId}/members`, { user_ids: userIds })
}
