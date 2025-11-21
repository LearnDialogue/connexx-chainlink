import React, { useState } from "react";
import Comment from "./Comment";
import { CommentType } from "../types/comment";
import { useMutation } from "@apollo/client";
import { LIKE_COMMENT, DISLIKE_COMMENT, ADD_REPLY, ADD_COMMENT } from "../graphql/queries/eventQueries";
import '../styles/components/comment-section.css';




interface Props {
  comment: CommentType;
  depth: number;
  eventId: string;
  refetchEvent: () => void;
}

const CommentThread: React.FC<Props> = ({ comment, depth, eventId, refetchEvent }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [likeComment] = useMutation(LIKE_COMMENT);
    const [dislikeComment] = useMutation(DISLIKE_COMMENT);
    const [addReply] = useMutation(ADD_REPLY);
    const handleLike = () => {
    likeComment({
      variables: { eventID: eventId, commentID: comment._id },
    }).then(() => {
        refetchEvent();  
      });
    };

    const handleDislike = () => {
    dislikeComment({
        variables: {
        eventID: eventId,
        commentID: comment._id,
        },
    }).then(() => {
        refetchEvent();  
      });
    };

    const [replyText, setReplyText] = useState("");

    const handleAddReply = () => {
    if (!replyText.trim()) return;

    addReply({
        variables: {
        eventID: eventId,
        commentID: comment._id,
        reply: replyText,
        },
    }).then(() => {
        refetchEvent();  
        setReplyText(""); // clear UI
        setShowReplyBox(false);
      });
    };


  return (
    <div style={{ marginLeft: depth * 30 }}>
      <Comment
        comment={comment.comment}
        userName={comment.userName}
        imageURL={comment.imageURL}
        createdAt={comment.createdAt}
        likes={comment.likes}
        dislikes={comment.dislikes}
        onReplyClick={() => setShowReplyBox(!showReplyBox)}
        onLikeClick={handleLike}
        onDislikeClick={handleDislike}
      />
        <hr className="comment-line"/>
      {/* Reply input */}
        {showReplyBox && (
        <div className="write-comment">
            <textarea 
            placeholder="Write a reply..." 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}/>
            <div className="button-container">
                <button className="button button-secondary" onClick={handleAddReply}>
                    <i className="fa-solid fa-arrow-up"></i>
                </button>
            </div>
        </div>
        )}


      {/* Render nested replies */}
      {comment.replies?.map((reply) => (
        <CommentThread
          key={reply._id}
          comment={reply}
          depth={depth + 1}
          eventId={eventId}
          refetchEvent={refetchEvent}
        />
      ))}
    </div>
  );
};

export default CommentThread;
