import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import './BoardWrite.css';

const BoardWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동
    console.log({ title, content });
    navigate('/board');
  };

  const handleCancel = () => {
    navigate('/board');
  };

  return (
    <div className="board-page">
      <Header title="문의글 작성" />
      <div className="board-content">
        <div className="board-container">
          <form className="write-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="title-input"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                className="content-input"
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                취소
              </button>
              <button type="submit" className="submit-button">
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer current="board" />
    </div>
  );
};

export default BoardWrite;
