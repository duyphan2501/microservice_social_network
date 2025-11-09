import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";

// Avatar Component
const Avatar = ({ src, alt, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-gray-300 flex-shrink-0`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500" />
      )}
    </div>
  );
};

// Single Comment Component
const Comment = ({ comment, onReply, level = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText, comment.username);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* Vertical line for nested comments */}
        {level > 0 && (
          <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
        )}

        <Avatar src={comment.avatar} alt={comment.username} size="md" />

        <div className="flex-grow">
          {/* Comment Content */}
          <div>
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <span className="font-semibold text-[15px]">
                  {comment.username}
                </span>
                {comment.replyTo && (
                  <span className="text-[15px] text-gray-900 ml-1">
                    <span className="text-blue-600 font-medium">
                      {comment.replyTo}
                    </span>
                  </span>
                )}
                <p className="text-[15px] text-gray-900 mt-1">{comment.text}</p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-5 mt-2">
              <span className="text-xs text-gray-500">{comment.time}</span>

              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 group"
              >
                <Heart
                  className={`w-[18px] h-[18px] ${
                    liked ? "fill-red-500 text-red-500" : "text-gray-500"
                  } group-hover:scale-110 transition-transform`}
                />
                {likeCount > 0 && (
                  <span className="text-xs text-gray-600">{likeCount}</span>
                )}
              </button>

              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1.5 group"
              >
                <MessageCircle className="w-[18px] h-[18px] text-gray-500 group-hover:scale-110 transition-transform" />
                {comment.replies && comment.replies.length > 0 && (
                  <span className="text-xs text-gray-600">
                    {comment.replies.length}
                  </span>
                )}
              </button>

              <button className="flex items-center gap-1.5 group">
                <Repeat2 className="w-[18px] h-[18px] text-gray-500 group-hover:scale-110 transition-transform" />
              </button>

              <button className="flex items-center gap-1.5 group">
                <Send className="w-[18px] h-[18px] text-gray-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="flex gap-2 mt-3">
              <Avatar size="sm" />
              <div className="flex-grow flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder={`Reply to ${comment.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleReplySubmit()}
                  className="flex-grow bg-transparent outline-none text-[15px]"
                  autoFocus
                />
                {replyText.trim() && (
                  <button
                    onClick={handleReplySubmit}
                    className="text-sm font-semibold text-black"
                  >
                    Post
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className={`mt-4 space-y-4 ${level === 0 ? "pl-8" : "pl-0"}`}>
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Post Detail Modal
const PostDetailModal = ({ post, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "Duy Trần",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      text: "Có Kobayashi mới thứ APTX 4869 há :))))",
      time: "3 ngày",
      likes: 1500,
      replies: [
        {
          id: 2,
          username: "Ngọc Ánh",
          replyTo: "Duy Trần",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
          text: "tr giống có Kobayashi thiệt á 😂😂",
          time: "3 ngày",
          likes: 7,
          replies: [],
        },
        {
          id: 3,
          username: "Châu Yến",
          replyTo: "Duy Trần",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "Yến Ngọcc",
          time: "3 ngày",
          likes: 2,
          replies: [],
        },
        {
          id: 4,
          username: "Dạ Lý",
          replyTo: "Duy Trần",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
          text: "Chú In",
          time: "3 ngày",
          likes: 0,
          replies: [],
        },
      ],
    },
    {
      id: 5,
      username: "Đặng Hạnh",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
      text: "có vậy thui mà năm cười nãy giờ =)))",
      time: "3 ngày",
      likes: 11,
      replies: [],
    },
    {
      id: 6,
      username: "Nguyễn Khiết Minh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      text: "Tue Mann",
      time: "3 ngày",
      likes: 0,
      replies: [
        {
          id: 7,
          username: "Tue Mann",
          replyTo: "Nguyễn Khiết Minh",
          avatar: null,
          text: "ải ớ sĩ mà:))",
          time: "3 ngày",
          likes: 1,
          replies: [],
        },
      ],
    },
  ]);

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        username: "You",
        avatar: null,
        text: commentText,
        time: "Just now",
        likes: 0,
        replies: [],
      };
      setComments([newComment, ...comments]);
      setCommentText("");
    }
  };

  const handleReply = (parentId, replyText, replyToUsername) => {
    const addReplyToComment = (commentsList) => {
      return commentsList.map((comment) => {
        if (comment.id === parentId) {
          const newReply = {
            id: Date.now(),
            username: "You",
            replyTo: replyToUsername,
            avatar: null,
            text: replyText,
            time: "Just now",
            likes: 0,
            replies: [],
          };
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(addReplyToComment(comments));
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-[15px]">Thread</h2>
          <p className="text-xs text-gray-500">6.8K views</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Original Post */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex gap-3 mb-3">
            <Avatar src={post.avatar} alt={post.username} size="md" />
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[15px]">
                  {post.username}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{post.time}</span>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <p className="text-[15px] mt-2 mb-3">{post.content}</p>

              {post.image && (
                <div className="rounded-2xl overflow-hidden mb-3">
                  <img src={post.image} alt="Post" className="w-full" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-5">
                <button className="flex items-center gap-2 group">
                  <Heart className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600">{post.likes}</span>
                </button>

                <button className="flex items-center gap-2 group">
                  <MessageCircle className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600">
                    {comments.length}
                  </span>
                </button>

                <button className="flex items-center gap-2 group">
                  <Repeat2 className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600">{post.reposts}</span>
                </button>

                <button className="flex items-center gap-2 group">
                  <Send className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600">{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-4 py-4 space-y-6">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} onReply={handleReply} />
          ))}
        </div>

        {/* View Activity */}
        <div className="px-4 py-3 border-t border-gray-200">
          <button className="text-sm text-gray-500 hover:text-gray-700">
            View activity →
          </button>
        </div>
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Avatar size="md" />
          <div className="flex-grow flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Reply to thread..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              className="flex-grow bg-transparent outline-none text-[15px]"
            />
            {commentText.trim() && (
              <button
                onClick={handleAddComment}
                className="text-sm font-semibold text-black"
              >
                Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ThreadComment = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const Post = {
    id: 1,
    username: "thanhcmnrne",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    time: "5h",
    content: "Nhắm mắt thử xem",
    image:
      "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80",
    likes: 152,
    reposts: 18,
    shares: 90,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isModalOpen && (
        <PostDetailModal post={Post} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default ThreadComment;
