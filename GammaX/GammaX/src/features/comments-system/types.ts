export interface Comment {
  id: string;
  presentationId: string;
  slideId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
  parentId?: string; // For replies
  replies?: Comment[];
}

export interface CommentCreateDTO {
  presentationId: string;
  slideId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
}

export interface CommentUpdateDTO {
  content?: string;
  resolved?: boolean;
}

export interface CommentsManager {
  createComment(comment: CommentCreateDTO): Promise<Comment>;
  updateComment(id: string, updates: CommentUpdateDTO): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  getComments(presentationId: string): Promise<Comment[]>;
  getCommentsBySlide(presentationId: string, slideId: string): Promise<Comment[]>;
  resolveComment(id: string, userId: string): Promise<Comment>;
}
