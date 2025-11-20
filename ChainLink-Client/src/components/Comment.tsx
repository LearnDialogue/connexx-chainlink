import Avatar from 'react-avatar';
import '../styles/components/comment-section.css';
import UserAvatar from './UserAvatar';


interface CommentProps {
  comment: string;
  userName: string;
  imageURL: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  onReplyClick?: () => void;
  onLikeClick?: () => void;
  onDislikeClick?: () => void;
}

export const Comment: React.FC<CommentProps> = ({ comment,
  userName,
  imageURL,
  createdAt,
  likes,
  dislikes,
  onReplyClick, 
  onLikeClick,
  onDislikeClick
  }) => {
  return (
    <div className="comment-card">
      <div className="row w-100 justify-between">
        <div className="row gap-5">
          <UserAvatar username={userName} hasProfileImage={!!imageURL} showImage={true} />
          <div className="user-name">{userName}</div>
          <div className="small-date">10/01/2025 </div>
        </div>
        <div className="comment-actions">
          <button className="like-btn" onClick={onLikeClick}>
            <i className="fa-solid fa-thumbs-up"></i> {likes.length}
          </button>
          <button className="dislike-btn" onClick={onDislikeClick}>
            <i className="fa-solid fa-thumbs-down"></i> {dislikes.length}
          </button>
        </div>
      </div>
      <div>
        <div className="comment-text">{comment}</div>
      </div>
      <div className="w-100 justify-end">
        <button className="reply-btn" onClick={onReplyClick}>
            Reply
          </button>
      </div>
      
    </div>
  );
};

export default Comment;