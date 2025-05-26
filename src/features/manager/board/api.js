// api.js

import axios from 'axios';

const BASE_API_URL = 'http://localhost:8080/api/v1/manager/board'; // Spring Boot 엔드포인트에 맞춤

export async function fetchPosts() {
  const res = await axios.get(`${BASE_API_URL}/list`); // GET /api/v1/manager/board/list
  return res.data.data; // CommonApiResponse 구조면 .data.data가 실제 리스트
}

export async function createPost(post) {
  const res = await axios.post(BASE_API_URL, post); // POST /api/v1/manager/board
  return res.data.data.id; // CommonApiResponse 구조면 .data.data.id가 게시글 PK
}

export async function fetchPost(id) {
  const res = await axios.get(`${BASE_API_URL}/list/${id}`); // GET /api/v1/manager/board/list/{id}
  return res.data.data;
}

export async function updatePost(id, post) {
  await axios.put(`${BASE_API_URL}/update/${id}`, post); // PUT /api/v1/manager/board/update/{id}
}

export async function deletePost(id) {
  await axios.delete(`${BASE_API_URL}/delete/${id}`); // DELETE /api/v1/manager/board/delete/{id}
}
