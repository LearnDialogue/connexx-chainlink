export interface CommentType {
  _id: string;
  comment: string;
  userName: string;
  imageURL: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  replies: CommentType[];
}