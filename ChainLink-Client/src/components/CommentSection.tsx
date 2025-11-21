import CommentThread from "./CommentThread";
import { CommentType } from "../types/comment";
import "../styles/components/comment-section.css";
import { useMutation } from "@apollo/client";
import { ADD_COMMENT } from "../graphql/queries/eventQueries";
import React, { useState } from "react";

interface Props {
  comments: CommentType[];
  eventId: string;
  refetchEvent: () => void;
}

export const CommentSection: React.FC<Props> = ({ comments, eventId, refetchEvent }) => {
    const [addComment] = useMutation(ADD_COMMENT);
    const [commentText, setCommentText] = useState("");

    const handleAddComment = () => {
    if (!commentText.trim()) return;

    addComment({
        variables: { eventID: eventId, comment: commentText },
    }).then(() => {
        refetchEvent();   // refresh parent data
    });

    setCommentText("");
    };

  return (
    <div className="comment-section">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      <div className="comment-container">
        
        {comments.length === 0 ? (
            <div className="no-comments">No comments yet — be the first!</div>
            ) : (
            comments.map((c) => (
                <CommentThread
                key={c._id}
                comment={c}
                depth={0}
                eventId={eventId}
                refetchEvent={refetchEvent}
                />
            ))
        )}
      </div>

      <div className="write-comment">
        <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
        />
        <div className="button-container">
          <button className="button button-secondary" onClick={handleAddComment}>
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;