import api from '@/api/http'

export async function fetchUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function inviteUsers(boardId: number, userIds: number[]) {
  await api.post(`/boards/${boardId}/members`, { user_ids: userIds })
}

export async function removeBoardMember(boardId: number, userId: number) {
  await api.delete(`/boards/${boardId}/members/${userId}`)
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/users/me')
  return data
}
